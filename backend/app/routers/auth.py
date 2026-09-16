diff --git a/backend/app/routers/auth.py b/backend/app/routers/auth.py
index 1234567..89abcde 100644
--- a/backend/app/routers/auth.py
+++ b/backend/app/routers/auth.py
@@ -38,6 +38,7 @@ def signup(payload: UserCreate, db: Session = Depends(get_db)) -> Token:
     if get_user_by_email(db, payload.email):
         raise HTTPException(status_code=400, detail="Email already registered")
     try:
+        validate_password_strength(payload.password)
         user = register_user(db, payload.username, payload.email, payload.password, payload.full_name)
     except ValueError as exc:
         raise HTTPException(status_code=400, detail=str(exc))