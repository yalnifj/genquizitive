<?php
// Requires: composer require firebase/php-jwt
use Firebase\JWT\JWT;

// Get your service account's email address and private key from the JSON key file
$service_account_email = "firebase-adminsdk-jtrla@genquizitive-live.iam.gserviceaccount.com";
$private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCm2BGjVfeN5uCa\nDc4zYtgep8Xbx4TQh5uSm8y0pwa5CWV8TEKrxhIerd7UPH/GYaqt1cncl6sngRkS\nMSRGqFb6/5zfBp3mXruUBu3Bq0J22DA5WFPw7Ib/A/ttiew01VVIl2ZuBYXDs3zt\nELd5qHvNsfxjQavScPZxT6XqDCi1E4bMxlyhC2XXUxGgg0L17275Ktw/+DZ12yJS\nexLxH99zFotzsNb+RoaSzlKsYuNBdR4nDaltb0lnMl97PdF40hgvDtXCue7mQybS\n8bLCst2MZISeyTxrAMAlBfs69ciXI0W9LOuV2Tve0tN5sosN86jbi+aVWbKVHMGJ\nKPhdfZzVAgMBAAECggEAepZ9dy6eAsRluKt2G2l/9B4/kXlqi7FnzHPvF7k1hlVy\nHL8HqaCSBbqo4/ZDx+ZQ+wL/G7bQyejgG+7Bga0Eo82WXIRHFlH6rwvcO5Vy81Fr\nNWdB3d5cXhl17okNZdBtpjWfzC0AmMdTfffvZ1M1C/C/ycohzjCz0pO8C1i9vDUZ\n47B++4zylKzcB7Nf3bEx8PAj3vBPuT8ADNGZ+bnJ3xCNfbF6lTfWw3JzV5x4tXoG\nfUGBlcA17HkQJNAlwBhtyurpqgsuwfBLZYiRoi8jw5ga0257qRWvBQ9duCTRRl0M\nQi62PacS142UFDY+X0GNCLzyBhQKQkaU0j+SkFciTQKBgQDUEVbYcQex4SC7Xzc+\nqjkEacIzOdi1Lp6durs+0U4SGTcO8GQo4NFfHfvYJ9GkxUIPu0ZL6TgdqvYf7Ruq\n9qVSdXMRtHZ4/Ef4a3FVm1f/Us0OMoTYixuC9+T90mgnGDwIXqUREk7mF8TN3MCF\nYzjI6ddud7z8qaMDYlk7p4v3CwKBgQDJaF1xQBYWGq4/Xs+2GL5494ZHY1byMgPN\nF+MCG/t8GfvUlTXp9TtKaPnj3Jo3aMkQToyevI3qLN+rtQbLa+oKqoWpm18z23OC\ntmWUO5nYpOiwfwxdlRDDgGGmIcM/7FAUtVOAN+cHan6GIe2EG/V0WtpCZLlLiCvu\nfpKCYpWnnwKBgGjHrG5C4rdr8Z1CvWwT9RoOGyruUPmscCikw7GU/wsINGEIO6TK\n+AgUK4QwoG/WGv7k3CXTtKtL9lHt+HavaR3l9BXyYXsDw5ellpjiqUb5JWH3ahYI\nHW7Hhvg2hsmSOs8z3EEkF6GuasoAYYtGbB8xEwV82f7I3kdkx4wnC4vjAoGARHh+\ni+nFmG4pntGUu8tdtbIwrERRYrUuJaNhQW5R6LbMrlCrq4X7Sii2C4kLxJqTAEAz\n/iML+/iVccJxNObTAh1Go4p2qyKH+oAXuHUqsEQf9yC6C3aJ5GzYxankvu6Pqvqa\nEJTwrcy+hssx/B+lKpFYcgncFJmOld3h4QGy7vECgYAkfUfOqItSGnrBzPzG6gHQ\nm5/XO7xZZhwiCx4J+x9LHVcupbpJul4WK9jayaX504z1H2QNMz7t2T0LKP1x98Gl\nnhbT3RCZKvMQVYDj3jBM+wajl3OfoGIzxjtOL4G6rLY/MIqHV1/clsH8XvVid9kn\n3QVajHLiODvYkvk2/BARhQ==\n-----END PRIVATE KEY-----\n";

function create_custom_token($uid) {
  global $service_account_email, $private_key;

  $now_seconds = time();
  $payload = array(
    "iss" => $service_account_email,
    "sub" => $service_account_email,
    "aud" => "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
    "iat" => $now_seconds,
    "exp" => $now_seconds+(60*60),  // Maximum expiration time is one hour
    "uid" => $uid,
    "claims" => array()
  );
  return JWT::encode($payload, $private_key, "RS256");
}

session_start();

$uid = $_POST["uid"];
$token = $_POST["token"];

if (empty($token) || empty($uid) || $token != $_SESSION["FS_AUTH_TOKEN"]) {
  http_response_code(401);
  print("Invalid token or uid");
} else {
  $cutom_token = create_custom_token($uid);
  print($cutom_token);
}
?>