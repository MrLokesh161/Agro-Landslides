    if not payload.username or not payload.password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    user = authenticate_user(db, payload.username, payload.password)