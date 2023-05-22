const nodemailer = require("nodemailer");
const dkim = require("dkim");
const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAw/G2K1VrgMsNtCbKWA+JvCaWU4TBxL9mdHOg73Pj8+AIVvfb
BytTWjYTBG9IZUMlDg92j7jon0dCFQJN8J0/Fwcvf4GSJW+lLP2JLvf1phrwGYua
sKmxprnJe3VF7N1rk7XLfFc16Zj4iKDNF7Rp/jXAJLlHuzXpd0Z+7W+p0C56+esw
2hxrbVBBCC9vJgRgvapO05EZXZ+IVuvoy5d7L14I1BaEBoIeq5MGaa3DTXhxlabe
g2vu0EpNgo5jjx1PrHqrtIELWL5ppW6r/S08JoH/VmJUjjejDF8/rawyBDYmJylf
5+QX4Hjpx6X8A0zMLRFipaH+5V3elGglPApShQIDAQABAoIBAQCrSkMQ8LRwu5E4
OmzKvJKQiz8Atd5aK2PaSzaV/T559A/2TugHBWXxR7IqP0oPU7ox52yiyWd5zeZD
zWbq/9umOt7X3SIwXcAMa3sgNx1kXsoj2rmY1E97y5AJwAQnw4yGbPb8tJRpqBMk
BUYlAc9irgRRVjMRwlhcr6DH2cSeOmr6ZjXrs3m/hUmxOgEjo0f1d0VMYQv2tMMI
BxgqoCEcaMrnvz7fcMLG00+TZGJB+224ExOnN+Gne90WJS48MrHVnty3DamHfvmo
vucQD3DqkmrHrkDDR0VBvXtDZR7omPUP/aCUgbtPyDs/Sk5Yc1Zy46t2nYATIdax
PKrI6i/hAoGBAPIlqxRa7QwEgb19j2tJzU0e93fPrQsxJOJZJDoAUFD9V9ewYxOm
KMuRJzoLLRoPxIXxGi2n1JPpgfBTfMn4sbgcmptIg2NieQ4YbudL4mSsxlf+71Nf
zcMff/gEjmmm9VRVnhWeH0cUuRcP71yynHPvruQhQx5KEwQwF+qxkJ25AoGBAM8n
Ymw/3svUwANLsXi3IUAPN3xiRpCEvrQbpXZ5s4ZrzR2PmDk6hDhu3olYIFdsNiPw
Js/rvyNRNqszzdf6dsWZQ8Z84TiRcqPNRTDEDGsEoLUimeQpOcB/tcAdwhW/4ph8
CbL5Pfo+HIwNQRY1GQkgHtz4G3ImJheb2qxqd+EtAoGBAI0mO/VfkzIgJmiImmNV
3+CGnoYufpY5jWCLybwtlqO/KcdGwFohz0HqWM1S2nWIn2vcQQBABoA5605lvCYX
W7EQq2a8/CmgqyP2Rh95cnxw4iVFK8iT3eNRp0yxizo24mbIiZ/cTism/0VcOpD0
ZJKIMpA0e2ValH8qcaaS3tOxAoGAa+Y/xdKe4dy3BwBuOEpq70r9w7QMvUnnazjb
PpK1h9auyC77QxPPuvVExJU6g07CBIYaMULCFEtBBnu9RDoZk2L5gnGZfjWEWP2a
hIQZU8TdUHvtXIJ8ql/a826MoXeJN5OkGazpM2cWx3w/4qlVmQM6EC7LXPGx9aog
hJ4QQyECgYEA4Y303a32QnxnCg25tbn0xD2/UiT6LJjo71h6GzYN87vONsUaYMVD
6k3gvDPG2NRhFlnUQRou+BoBfUm6KRNOJgwLiweaRgWRW4mm6kruiARC59jnfYI3
lSZrB6yroo+2IuSyFzT+lrwfu3fLAngJaOs0lTAUt1DZTt0hgNQjW20=
-----END RSA PRIVATE KEY-----
`;

const client_url = "https://crm-project-wota.vercel.app/";
// const client_url = "http://localhost:3000/";
exports.sendVerificationEmail = async (email, verificationtoken, username) => {
  const transporter = nodemailer.createTransport({
    host: "mail.ultimateoutsourcing.co.uk",
    port: 587,
    secure: false,
    auth: {
      user: "crm-admin@ultimateoutsourcing.co.uk",
      pass: "Fawad@uol#admin",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "CRM Account Verification crm-admin@ultimateoutsourcing.co.uk",
    to: email,
    subject: "Verify Your Email Address for CRM Account",
    html:
      "<h1>Hi " +
      username +
      '</h1><br/> <h4>I hope this email finds you well. You have registered an account with CRM. You need to verify your email.<br/>Please click on link to verify your email: <a href="' +
      client_url +
      "verify/" +
      verificationtoken +
      '">Verify Email</a></h4> <br/> <h4>If you are unable to verify your email. Please Contact Us at <span style="color: red; font-weight: bold;">crm-admin@ultimateoutsourcing.co.uk</span>. </h4> <br/> <h5>Regards</h5> <h5>CRM Team</h5>',
  };

  // Create DKIM signature
  const dkimHeader = dkim.Signature(
    mailOptions.from,
    mailOptions.to,
    mailOptions.html,
    {
      privateKey,
      keySelector: "dkim",
      algorithm: "rsa-sha256",
    }
  );

  // Add DKIM signature to email headers
  mailOptions.headers = {
    "X-DKIM": dkimHeader,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log(error);
  }
};

// send password reset email
exports.sendPasswordResetEmail = async (email, passwordresettoken) => {
  const transporter = nodemailer.createTransport({
    host: "mail.ultimateoutsourcing.co.uk",
    port: 587,
    secure: false,
    auth: {
      user: "crm-admin@ultimateoutsourcing.co.uk",
      pass: "Fawad@uol#admin",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "CRM Account reset link crm-admin@ultimateoutsourcing.co.uk",
    to: email,
    subject: "Password reset link",
    html: `<p>Hi there,</p>
    <p>You recently requested to reset your password for your CRM account. Click the button below to reset it.</p>
    <a href="${client_url}resetpassword">Click here to Reset your password</a>
    <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 30 minutes.</p>
    <p>Thanks,</p>
    <p>Your CRM Team</p>`,
  };

  // Create DKIM signature
  const dkimHeader = dkim.Signature(
    mailOptions.from,
    mailOptions.to,
    mailOptions.html,
    {
      privateKey,
      keySelector: "dkim",
      algorithm: "rsa-sha256",
    }
  );

  // Add DKIM signature to email headers
  mailOptions.headers = {
    "X-DKIM": dkimHeader,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log(error);
  }
};
// send password reset email
