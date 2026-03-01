# Production TODOs

## Backend Changes Required Before Production

### 1. OTP Generation (CRITICAL)
**File**: `api/app/services/auth_service.py` (Line 249)

**Current State**: 
```python
otp = "130499"  # TODO: Replace with random OTP generation in production
```

**What to do**:
- Replace hardcoded OTP with random 6-digit generation
- Restore: `otp = f"{random.randint(100000, 999999)}"`
- This is currently hardcoded for testing purposes only

---

### 2. OTP Attempt Limit (IMPORTANT)
**File**: `api/app/utils/attempt_tracking.py` (Line 12)

**Current State**:
```python
MAX_OTP_ATTEMPTS = 20  # Temporarily increased for testing
```

**What to do**:
- Decide on final attempt limit for OTP verification
- Currently set to 20 for testing
- Recommended production value: 5 attempts (matches login)
- Change to: `MAX_OTP_ATTEMPTS = 5` (or desired value)

---

### 3. Email Service Integration (IMPORTANT)
**File**: `api/app/services/auth_service.py` (Line 265)

**Current State**:
```python
# TODO: In production, integrate with an email service (SendGrid, AWS SES, etc.)
# For now, we'll just return success
print(f"OTP for {normalized_email}: {otp}")  # For development only
```

**What to do**:
- Integrate with email service (SendGrid, AWS SES, or similar)
- Actually send OTP emails to users
- Remove console logging
- Add error handling for email delivery failures

---

### 4. Database Cleanup - OTP Records
**File**: `api/app/utils/attempt_tracking.py`

**What to do**:
- Implement periodic cleanup of expired OTP records
- Delete `email_otps` collection entries older than 10 minutes
- Add a scheduled task/cron job for cleanup (recommend: every 5 minutes)
- Prevents database bloat from old OTP attempts

---

### 5. Database Cleanup - Attempt Tracking Records
**File**: `api/app/utils/attempt_tracking.py`

**What to do**:
- Implement periodic cleanup of old login/OTP attempt records
- Delete `login_attempts` and `otp_attempts` records older than 24 hours
- Add a scheduled cleanup task
- Prevents accumulation of old security tracking data

---

### 6. Rate Limiting Configuration
**File**: `api/app/utils/rate_limit.py`

**Current State**:
```python
rate_limit_dep = limiter.limit("60/minute")
```

**What to do**:
- Review and adjust rate limits based on production needs
- Consider separate limits for different endpoints
- Test with expected user load
- Document rate limit strategy

---

### 7. Logging and Monitoring
**What to do**:
- Replace `print()` statements with proper logging
- Add security event logging for:
  - Failed OTP attempts
  - Account lockouts
  - Failed login attempts
- Set up monitoring and alerting for suspicious patterns

---

### 8. Error Messages Security
**Files**: `api/app/services/auth_service.py`

**What to do**:
- Review error messages for information disclosure
- Ensure error messages don't reveal system details
- Currently showing remaining attempts (consider if this is desired)
- Test for timing attacks on OTP verification

---

## Frontend Changes Required Before Production

### 1. API Endpoint Configuration
**File**: `ui/.env`

**What to do**:
- Ensure `EXPO_PUBLIC_API_URL` is set to correct production backend URL
- Currently likely set to `http://localhost:8000/api/v1`
- Update for production domain

---

### 2. Error Message Customization
**Files**: 
- `ui/app/index.tsx` (Login screen)
- `ui/app/register.tsx` (Registration screen)

**What to do**:
- Review user-facing error messages
- Customize error messages for real production scenarios
- Add translations if multilingual support needed

---

## Security Review Checklist

- [ ] OTP generation is randomized
- [ ] Email sending is working in production
- [ ] Database cleanup tasks are running
- [ ] Rate limiting is appropriate for production load
- [ ] Logging is comprehensive for security audits
- [ ] Error messages don't leak sensitive information
- [ ] API endpoint URLs are correct for production
- [ ] HTTPS is enforced (not HTTP)
- [ ] CORS is properly configured for production domain
- [ ] Database backups are configured
- [ ] Access logs are being maintained
- [ ] Failed login/OTP attempts have monitoring/alerting

---

## Testing Before Production

### 1. OTP Workflow
- [ ] Test OTP generation across multiple users
- [ ] Test OTP expiration (10-minute window)
- [ ] Test lockout after 20 failed attempts
- [ ] Test 10-minute lockout timer
- [ ] Test email delivery

### 2. Login Workflow
- [ ] Test login with correct credentials
- [ ] Test login with wrong credentials
- [ ] Test lockout after 5 failed attempts
- [ ] Test 10-minute lockout timer
- [ ] Test account deletion handling

### 3. Load Testing
- [ ] Test with expected concurrent users
- [ ] Test rate limiting effectiveness
- [ ] Monitor database performance

### 4. Database Cleanup
- [ ] Verify expired OTP records are cleaned up
- [ ] Verify old attempt records are cleaned up
- [ ] Ensure cleanup doesn't impact active users

---

## Timeline Suggestion

1. **Immediate** (Before any user testing):
   - [ ] Update OTP generation from hardcoded value
   - [ ] Set final OTP_MAX_ATTEMPTS value
   - [ ] Set up email service

2. **Before Beta**:
   - [ ] Implement database cleanup tasks
   - [ ] Add comprehensive logging
   - [ ] Security review of error messages
   - [ ] Full testing suite

3. **Before General Production**:
   - [ ] Load testing
   - [ ] Monitoring and alerting setup
   - [ ] Database backup strategy
   - [ ] Incident response plan

---

**Last Updated**: March 1, 2026
**Status**: In Development - Testing Phase
