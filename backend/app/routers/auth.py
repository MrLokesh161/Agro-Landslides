    if not payload.username or not payload.password:
        raise HTTPException(status_code=400, detail='Email and password are required')
    user = authenticate_user(db, payload.username, payload.password)