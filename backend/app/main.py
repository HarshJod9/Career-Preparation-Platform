from __future__ import annotations

import hashlib
import hmac
import os
import re
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, ConfigDict, Field
from pypdf import PdfReader
from sqlalchemy import DateTime, ForeignKey, LargeBinary, String, create_engine, select
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://careerai:careerai@localhost:5432/careerai")
JWT_SECRET = os.getenv("JWT_SECRET", "local-development-secret-change-before-sharing")
JWT_ALGORITHM = "HS256"
TOKEN_MINUTES = 60 * 24 * 7
MAX_RESUME_BYTES = 10 * 1024 * 1024

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    target_role: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    resumes: Mapped[list[Resume]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    size_bytes: Mapped[int] = mapped_column(nullable=False)
    file_data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    extracted_text: Mapped[str] = mapped_column(nullable=False, default="")
    skills: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user: Mapped[User] = relationship(back_populates="resumes")


ROLES: dict[str, list[str]] = {
    "Frontend Developer": ["JavaScript", "React", "HTML/CSS", "Git", "Accessibility", "Testing"],
    "Data Analyst": ["SQL", "Python", "Excel", "Statistics", "Data visualization", "Communication"],
    "Product Designer": ["Figma", "User research", "Prototyping", "Wireframing", "Accessibility", "Communication"],
    "Project Manager": ["Project management", "Agile", "Communication", "Risk management", "Data analysis", "Leadership"],
}
SKILL_TERMS: dict[str, tuple[str, ...]] = {
    "JavaScript": ("javascript", "ecmascript", "es6"), "TypeScript": ("typescript",),
    "React": ("react", "react.js", "reactjs"), "HTML/CSS": ("html", "css", "html5", "css3"),
    "Git": ("git", "github", "gitlab"), "Accessibility": ("accessibility", "wcag", "a11y"),
    "Testing": ("testing", "jest", "vitest", "cypress", "playwright"),
    "SQL": ("sql", "postgresql", "mysql", "sqlite"), "Python": ("python",),
    "Excel": ("excel", "spreadsheets", "vlookup", "pivot table"),
    "Statistics": ("statistics", "statistical analysis"),
    "Data visualization": ("data visualization", "tableau", "power bi", "matplotlib", "looker"),
    "Communication": ("communication", "presentation", "stakeholder management"),
    "Figma": ("figma",), "User research": ("user research", "usability testing", "user interviews"),
    "Prototyping": ("prototyping", "prototype"), "Wireframing": ("wireframing", "wireframe"),
    "Project management": ("project management", "project planning"), "Agile": ("agile", "scrum", "kanban"),
    "Risk management": ("risk management", "risk assessment"), "Leadership": ("leadership", "team leadership", "mentoring"),
    "Node.js": ("node.js", "nodejs"), "Java": ("java",), "C++": ("c++",), "C#": ("c#",),
    "Docker": ("docker",), "AWS": ("aws", "amazon web services"),
    "Machine learning": ("machine learning", "scikit-learn", "tensorflow", "pytorch"),
    "Problem solving": ("problem solving", "analytical thinking"),
    "Data analysis": ("data analysis", "data analytics", "analytics"),
}


def extract_skills(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", text).lower()
    found = []
    for skill, terms in SKILL_TERMS.items():
        if any(re.search(rf"(?<![a-z0-9]){re.escape(term)}(?![a-z0-9])", normalized) for term in terms):
            found.append(skill)
    return found


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        algorithm, salt_hex, digest_hex = stored.split("$")
        if algorithm != "scrypt":
            return False
        digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=2**14, r=8, p=1)
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


class Credentials(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    email: str
    target_role: str | None = None


class ProfileUpdate(BaseModel):
    target_role: str | None = Field(default=None, max_length=100)


class ResumeOut(BaseModel):
    id: UUID
    name: str
    size: int
    uploaded_at: datetime
    skills: list[str]
    text_length: int


def get_db():
    with SessionLocal() as db:
        yield db


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(HTTPBearer(auto_error=False))],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in to continue.")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = UUID(payload["sub"])
    except (JWTError, ValueError, KeyError):
        raise HTTPException(status_code=401, detail="Your session expired. Please sign in again.")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Account no longer exists.")
    return user


def make_token(user: User) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_MINUTES)
    return jwt.encode({"sub": str(user.id), "exp": expires}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def resume_out(resume: Resume) -> ResumeOut:
    return ResumeOut(id=resume.id, name=resume.file_name, size=resume.size_bytes,
                     uploaded_at=resume.uploaded_at, skills=resume.skills,
                     text_length=len(resume.extracted_text))


app = FastAPI(title="CareerAI API", version="0.1.0", description="Phase 1 account, profile, resume, and career profile API.")
app.add_middleware(CORSMiddleware, allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health(db: Annotated[Session, Depends(get_db)]):
    db.execute(select(1))
    return {"status": "ok", "database": "connected"}


@app.post("/api/auth/register", response_model=dict, status_code=201)
def register(payload: Credentials, db: Annotated[Session, Depends(get_db)]):
    email = payload.email.strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    name = (payload.name or email.split("@", 1)[0]).strip()
    user = User(name=name, email=email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": make_token(user), "token_type": "bearer", "user": UserOut.model_validate(user).model_dump(mode="json")}


@app.post("/api/auth/login", response_model=dict)
def login(payload: Credentials, db: Annotated[Session, Depends(get_db)]):
    user = db.scalar(select(User).where(User.email == payload.email.strip().lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return {"access_token": make_token(user), "token_type": "bearer", "user": UserOut.model_validate(user).model_dump(mode="json")}


@app.get("/api/profile", response_model=UserOut)
def get_profile(user: Annotated[User, Depends(get_current_user)]):
    return user


@app.patch("/api/profile", response_model=UserOut)
def update_profile(payload: ProfileUpdate, user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]):
    if payload.target_role not in (None, "") and payload.target_role not in ROLES:
        raise HTTPException(status_code=422, detail="Choose a supported target role.")
    user.target_role = payload.target_role or None
    db.commit()
    db.refresh(user)
    return user


@app.get("/api/resumes", response_model=list[ResumeOut])
def list_resumes(user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]):
    resumes = db.scalars(select(Resume).where(Resume.user_id == user.id).order_by(Resume.uploaded_at.desc())).all()
    return [resume_out(item) for item in resumes]


@app.post("/api/resumes", response_model=ResumeOut, status_code=201)
async def upload_resume(file: Annotated[UploadFile, File()], user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]):
    filename = (file.filename or "resume.pdf").replace("\\", "/").split("/")[-1]
    if not filename.lower().endswith(".pdf") or file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=415, detail="Upload a PDF resume.")
    data = await file.read(MAX_RESUME_BYTES + 1)
    if len(data) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=413, detail="Your resume must be 10 MB or smaller.")
    if not data.startswith(b"%PDF-"):
        raise HTTPException(status_code=415, detail="The selected file is not a valid PDF.")
    try:
        reader = PdfReader(__import__("io").BytesIO(data))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        raise HTTPException(status_code=422, detail="We could not read this PDF. Try another file.")
    db.query(Resume).filter(Resume.user_id == user.id).delete(synchronize_session=False)
    resume = Resume(user_id=user.id, file_name=filename, size_bytes=len(data), file_data=data,
                    extracted_text=text, skills=extract_skills(text))
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume_out(resume)


@app.delete("/api/resumes/{resume_id}", status_code=204)
def delete_resume(resume_id: UUID, user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]):
    resume = db.scalar(select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id))
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found.")
    db.delete(resume)
    db.commit()


@app.get("/api/career/roles")
def list_roles(user: Annotated[User, Depends(get_current_user)]):
    return {"roles": ROLES}


@app.get("/api/career/skill-gap")
def skill_gap(user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]):
    target_role = user.target_role
    required = ROLES.get(target_role or "", [])
    resume = db.scalar(select(Resume).where(Resume.user_id == user.id).order_by(Resume.uploaded_at.desc()))
    skills = resume.skills if resume else []
    matched = [skill for skill in required if skill in skills]
    return {"target_role": target_role, "required_skills": required, "user_skills": skills,
            "matched_skills": matched, "missing_skills": [skill for skill in required if skill not in skills],
            "match_percent": round(len(matched) / len(required) * 100) if required and resume else None}
