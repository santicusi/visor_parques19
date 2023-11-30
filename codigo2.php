<?php

$host = 'localhost';
$bd = 'taller2';
$user = 'postgres';
$pass = 'santicusi2001';

// Conectar a la base de datos
$conexion = pg_connect("host=$host dbname=$bd user=$user password=$pass");

// Verificar la conexión
if (!$conexion) {
    echo json_encode(["success" => false, "message" => "No se pudo conectar a la base de datos"]);
    exit;
}

// Consulta para recuperar todos los marcadores, incluyendo el tipo de parque
$query = "SELECT id, latitud, longitud, parques, descripcion FROM marcadores";
$result = pg_query($conexion, $query);

// Verificar si la consulta fue exitosa
if ($result) {
    // Convertir los resultados en un array asociativo
    $marcadores = pg_fetch_all($result);

    // Enviar los datos en formato JSON
    echo json_encode($marcadores);
} else {
    // Enviar un mensaje de error en formato JSON si la consulta falla
    echo json_encode(["success" => false, "message" => "Error al recuperar los datos"]);
}

// Cerrar la conexión
pg_close($conexion);
?>

