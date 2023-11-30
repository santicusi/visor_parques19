<?php

header('Content-Type: application/json; charset=utf-8');

$host = 'localhost';
$bd = 'taller2';
$user = 'postgres';
$pass = 'santicusi2001';

// Establecer el tipo de contenido a JSON
header('Content-Type: application/json');

// Conectar a la base de datos
$conexion = pg_connect("host=$host dbname=$bd user=$user password=$pass");

// Verificar la conexión
if (!$conexion) {
    echo json_encode(["success" => false, "message" => "No se pudo conectar a la base de datos"]);
    exit;
}

// Obtener los datos enviados desde el formulario y validarlos
$id = isset($_POST['id']) ? (int)$_POST['id'] : null;
$parques = $_POST['parques'];
$descripcion = $_POST['descripcion'];

if ($id === null) {
    echo json_encode(["success" => false, "message" => "ID del marcador no definido o inválido"]);
    exit;
}

// Preparar la consulta SQL
$query = "UPDATE marcadores SET parques = $1, descripcion = $2 WHERE id = $3";

// Preparar y ejecutar la consulta
if ($consultaPreparada = pg_prepare($conexion, "", $query)) {
    $resultado = pg_execute($conexion, "", [$parques, $descripcion, $id]);

    // Verificar si la actualización fue exitosa
    if ($resultado === false) {
        echo json_encode(["success" => false, "message" => "Error al ejecutar la consulta: " . pg_last_error($conexion)]);
        exit;
    }

    echo json_encode(["success" => true, "message" => "Marcador actualizado con éxito"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al preparar la consulta"]);
}

// Cerrar la conexión
pg_close($conexion);
?>


