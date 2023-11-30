<?php

$host = 'localhost';
$bd = 'taller2';
$user = 'postgres';
$pass = 'santicusi2001';

$conexion = pg_connect("host=$host dbname=$bd user=$user password=$pass");

if (!$conexion) {
    echo json_encode(["success" => false, "message" => "No se pudo conectar a la base de datos"]);
    exit;
}

// Insertar un nuevo marcador
$query = "INSERT INTO marcadores(latitud, longitud, parques, descripcion) VALUES($1, $2, $3, $4)";

if (pg_prepare($conexion, "", $query)) {
    $result = pg_execute($conexion, "", [$_POST['latitud'], $_POST['longitud'], $_POST['parques'], $_POST['descripcion']]);

    if ($result) {
        echo json_encode(["success" => true, "message" => "Marcador guardado con éxito"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error al insertar los datos"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Error al preparar la consulta"]);
}

pg_close($conexion);
?>











