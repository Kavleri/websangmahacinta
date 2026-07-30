<?php
// cPanel PHP API Proxy - Bridge to Vercel Backend
// Includes Authorization Token Forwarding for Admin & Staff Auth
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$path = isset($_GET['path']) ? $_GET['path'] : '';
if (empty($path)) {
    $uri = $_SERVER['REQUEST_URI'];
    if (strpos($uri, '/api/') !== false) {
        $parts = explode('/api/', $uri);
        $path = end($parts);
    }
}

$targetUrl = "https://backend-ten-umber-9dbevyts90.vercel.app/api/" . $path;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$method = $_SERVER['REQUEST_METHOD'];
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

// Forward request headers (Authorization token, Content-Type)
$forwardHeaders = array();

// Extract Authorization Header
$authToken = null;
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authToken = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $authToken = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (function_exists('getallheaders')) {
    $allHeaders = getallheaders();
    foreach ($allHeaders as $k => $v) {
        if (strtolower($k) === 'authorization') {
            $authToken = $v;
            break;
        }
    }
}

if (!empty($authToken)) {
    $forwardHeaders[] = "Authorization: " . $authToken;
}

// Extract Content-Type
if (isset($_SERVER['CONTENT_TYPE'])) {
    $forwardHeaders[] = "Content-Type: " . $_SERVER['CONTENT_TYPE'];
} else {
    $forwardHeaders[] = "Content-Type: application/json";
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);

if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
    $inputData = file_get_contents('php://input');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $inputData);
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 600) {
    http_response_code($httpCode);
} else {
    http_response_code(500);
}

header('Content-Type: application/json');
echo $response;
?>
