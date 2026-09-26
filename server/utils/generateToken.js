import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role) => {
  const token = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'stocksense_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.cookie('stocksense_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return token;
};

export default generateToken;
