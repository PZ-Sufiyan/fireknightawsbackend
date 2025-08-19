const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminInitiateAuthCommand,
  InitiateAuthCommand, // ✅ Add this
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  RespondToAuthChallengeCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const { generateSecretHash } = require('../utils/cognito');
const { userPool } = require('../config/cognito'); // Import the userPool here

const cognito = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

// REGISTER
exports.register = async (req, res) => {
  const { email, password } = req.body;

  const command = new SignUpCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    SecretHash: generateSecretHash(email, process.env.COGNITO_CLIENT_ID, process.env.COGNITO_CLIENT_SECRET),
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
    ],
  });

  try {
    const result = await cognito.send(command);
    res.json({ userSub: result.UserSub });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const secretHash = generateSecretHash(
    email,
    process.env.COGNITO_CLIENT_ID,
    process.env.COGNITO_CLIENT_SECRET
  );

  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: secretHash
    }
  };
  try {
    const command = new InitiateAuthCommand(params);
    const result = await cognito.send(command);

    console.log("Cognito login response:", result); // <-- Add this

    if (['SMS_MFA', 'EMAIL_OTP'].includes(result.ChallengeName)) {
      return res.json({
        message: 'MFA code required',
        challengeName: result.ChallengeName,
        session: result.Session
      });
    }


    if (!result.AuthenticationResult) {
      return res.status(401).json({ error: 'Authentication failed: No token returned', result });
    }

    res.json({
      idToken: result.AuthenticationResult.IdToken,
      accessToken: result.AuthenticationResult.AccessToken,
      refreshToken: result.AuthenticationResult.RefreshToken
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // First check if user exists and email is verified
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: email
    });

    const user = await cognito.send(getUserCommand);
    const emailVerified = user.UserAttributes.find(attr => attr.Name === 'email_verified')?.Value === 'true';

    if (!emailVerified) {
      return res.status(400).json({ 
        error: 'Email not verified. Please verify your email first.' 
      });
    }

    // Proceed with forgot password
    const secretHash = generateSecretHash(
      email,
      process.env.COGNITO_CLIENT_ID,
      process.env.COGNITO_CLIENT_SECRET
    );

    const command = new ForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      SecretHash: secretHash
    });

    const result = await cognito.send(command);
    
    console.log('Forgot password code delivery details:', result.CodeDeliveryDetails);
    
    res.json({ 
      message: "Code sent to email",
      destination: result.CodeDeliveryDetails.Destination 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    
    if (err.name === 'UserNotFoundException') {
      return res.status(400).json({ error: 'User not found' });
    }
    
    if (err.name === 'InvalidParameterException' && err.message.includes('email')) {
      return res.status(400).json({ error: 'Email not verified' });
    }
    
    res.status(400).json({ 
      error: err.message,
      code: err.name 
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  const secretHash = generateSecretHash(
    email,
    process.env.COGNITO_CLIENT_ID,
    process.env.COGNITO_CLIENT_SECRET
  );

  const command = new ConfirmForgotPasswordCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
    SecretHash: secretHash
  });

  try {
    const result = await cognito.send(command);
    res.json({ message: 'Password reset successful', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  const secretHash = generateSecretHash(
    email,
    process.env.COGNITO_CLIENT_ID,
    process.env.COGNITO_CLIENT_SECRET
  );

  const command = new ConfirmSignUpCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    SecretHash: secretHash
  });

  try {
    const result = await cognito.send(command);
    res.json({ message: 'Email verified successfully', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// RESEND VERIFICATION CODE
exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  const secretHash = generateSecretHash(
    email,
    process.env.COGNITO_CLIENT_ID,
    process.env.COGNITO_CLIENT_SECRET
  );

  const command = new ResendConfirmationCodeCommand({
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    SecretHash: secretHash
  });

  try {
    const result = await cognito.send(command);
    res.json({ message: 'Verification code resent to email', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.verifyMfa = async (req, res) => {
  const { email, session, code } = req.body;

  const secretHash = generateSecretHash(
    email,
    process.env.COGNITO_CLIENT_ID,
    process.env.COGNITO_CLIENT_SECRET
  );

  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    Session: session,
    ChallengeName: 'EMAIL_OTP',
    ChallengeResponses: {
      USERNAME: email,
      EMAIL_OTP_CODE: code, // ✅ Correct key here
      SECRET_HASH: secretHash
    }
  };

  const command = new RespondToAuthChallengeCommand(params);

  try {
    const result = await cognito.send(command);
    res.json({
      idToken: result.AuthenticationResult.IdToken,
      accessToken: result.AuthenticationResult.AccessToken,
      refreshToken: result.AuthenticationResult.RefreshToken
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

