<?php

/*
 * TareaController
 * ===================
 * Este controlador se encargará de gestionar todo lo relacionado con las tareas. La gran mayoría de métodos de esta clase
 * dependen de que seas mínimo profesor para poder utilizarlos.
 * Contiene métodos para mostrar las tareas, para crearlas, para corregir, para subir una entrega, para calificar la tarea,
 * para ver las 3 últimas tareas generales, para ver las 3 últimas tareas que ha subido un profesor específico, uno para
 * ver las entregas que se han enviado para una tarea y por último uno que muestra las tareas de un estudiante
 */
namespace App\Http\Controllers;

use App\Models\Entrega;
use App\Models\Tarea;
use App\Models\User;
use Carbon\Carbon;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TareaController extends Controller {
    public function __construct() {
        $this->middleware('auth:api', ['except' => ['ultimasTareas']]);
    }

    /*
     * Index
     * ==============
     * Devuelve todas las tareas que contengan un creador, es decir, a no ser que se haya modificado la BBDD debería mostrar
     * todas las tareas.
     */
    public function index() {
        return response()->json(Tarea::with('creador')->get());
    }

    /*
     * Store
     * ================
     * Este método será el encargado de crear tareas. Si no eres profesor o admin se te mostrará un mensaje de error
     * de permisos. Después, los datos recibidos, deberán pasar una validación la cual es la siguiente:
     *  1. Título --> Título de la tarea.
     *  2. Descripción --> Breve descripción de en qué consiste.
     *  3. Recompensa --> Cantidad de puntos que obtendrás una vez entregues dicha tarea si es correcta.
     *  4. Reenviar --> Se da la opción en ciertas tareas, de poder enviar una entrega en más de una ocasión.
     *
     * Una vez que pasa la validación se crea la tarea y posteriormente se muestra un mensaje de verificación al usuario.
     */
    public function store(Request $request) {
        if(Gate::denies('profesor-or-admin')) {
            return response()->json(['error' => 'No tienes permiso para crear tareas'], 403);
        }

        $validado = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'recompensa' => 'required|integer|min:1',
            'fecha' => 'required|date|after_or_equal:tomorrow',
            'reenviar' => 'boolean',
        ]);

        if($validado->fails()) {
            return response()->json($validado->errors(), 422);
        }

        $fecha = Carbon::createFromFormat('Y-m-d', $request->fecha, 'Europe/Madrid');

        $tarea = Tarea::create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'recompensa' => $request->recompensa,
            'creador_id' => Auth::id(),
            'fecha' => $fecha,
            'reenviar' => $request->reenviar ?? false
        ]);

        return response()->json(['message' => 'Tarea creada exitosamente.', 'tarea' => $tarea], 200);
    }

    /*
     * SubirEntrega
     * ======================
     * Este método será el encargado de guardar el archivo en la base de datos. Por defecto, cuando entregas la tarea ésta
     * pasa a tener un estado PENDIENTE y éste se mantendrá hasta que algún profesor o admin la corrija.
     * La ruta debe ser un archivo File. Si pasa la validación y la entrega se crea de forma correcta,
     * se mostrará un mensaje de confirmación. En el caso de que la validación falle, se mostrará un mensaje 422.
     * 
     * Una vez que se muestra el mensaje de confirmación, podremos encontrar el archivo en ritmatiza/backend/storage/app/public/uploads/entregas.
     */
    public function subirEntrega(Request $request, Tarea $tarea) {
        $validador = Validator::make($request->all(), [
            'ruta' => 'required|file|max:10240',
        ]);

        if($validador->fails()) {
            return response()->json($validador->errors(), 422);
        }

        $archivo = $request->file('ruta');
        $extension = $archivo->getClientOriginalExtension();
        $nombre = time() . '_' . Str::random(8) . '.' . $extension;

        $ruta = 'uploads/entregas';

        if(!Storage::disk('public')->exists($ruta)) {
            Storage::disk('public')->makeDirectory('$ruta');
        }

        $rutaAlmacenada = $archivo->storeAs($ruta, $nombre, 'public');

        $entrega = Entrega::create([
            'ruta' => $rutaAlmacenada,
            'tarea_id' => $tarea->id,
            'estudiante_id' => Auth::id(),
            'estado' => 'PENDIENTE',
        ]);

        return response()->json(['message' => 'Entrega subida. Pendiente de calificación', 'entrega' => $entrega], 200);
    }

    /*
     * CalificarEntrega
     * ============================
     * Para este método es obligatorio se admin o profesor, si no lo eres se te mostrará un mensaje de error de permisos.
     * Una vez consigas entrar se te mostrará un botón para aprobar la entrega o para rechazarla. En cualquiera de los dos
     * casos, actualizará el estado de la tarea al valor que se ha indicado. En el caso de aprobarla, se le asignarán los
     * puntos al usuario que realizó dicha entrega.
     * Finalmente, en el caso de que todo haya funcionado correctamente, se le mostrará un mensaje de éxito al usuario.
     */
    public function calificarEntrega(Request $request, Entrega $entrega) {
        if(Gate::denies('profesor-or-admin')) {
            return response()->json(['error', 'No tienes permiso para calificar esta tarea'], 403);
        }

        $validado = Validator::make($request->all(), [
            'estado' => 'required|in:APROBADA,RECHAZADA',
        ]);

        if($validado->fails()) {
            return response()->json($validado->errors(), 422);
        }

        $entrega->estado = $request->estado;
        $entrega->calificador_id = Auth::id();
        $entrega->save();

        if($entrega->estado === 'APROBADA') {
            $puntosGanados = $entrega->tarea->recompensa;
            $estudiante = User::find($entrega->estudiante_id);
            $estudiante->increment('puntos', $puntosGanados);
        }

        return response()->json(['message' => 'Entrega calificada y puntos entregados', 'entrega' => $entrega], 200);
    }

    /*
     * UltimasTareas
     * =======================
     * Este será el método que se utilizará como general para que cualquier usuario, al iniciar en nuestra aplicación
     * pueda ver las últimas 3 tareas que se han creado sin necesidad de loguearse o registrarse.
     *
     * Devuelve un objeto JSON con dichas tareas.
     */
    public function ultimasTareas() {
        $tareas = Tarea::with('creador')
            ->latest()
            ->limit(3)
            ->get();

        return response()->json($tareas);
    }

    /*
     * EntregasPorTarea
     * ============================
     * En este caso es obligatorio ser admin o profesor y en caso de no serlo se te mostrará un mensaje de error de
     * permisos. Si pasas este requisito, se te mostrarán todas las entregas realizadas por los estudiantes y 
     * que aun no hayan sido corregidas. La devolución de este método consiste en un objeto JSON con todas las entregas.
     */
    public function entregasPorTarea($creador_id) {
        if(Gate::denies('profesor-or-admin')) {
            return response()->json(['error' => 'No tienes permiso para ver todas las entregas'], 403);
        }
        
        $entregas = Entrega::join('tareas', 'entregas.tarea_id', '=', 'tareas.id')
            ->where('tareas.creador_id', $creador_id)
            ->where('entregas.estado', 'PENDIENTE')
            ->select('entregas.*', 'tareas.titulo as tarea_titulo', 'tareas.recompensa as tarea_recompensa')
            ->get();
            
        return response()->json($entregas);
    }

    /*
     * misEntregas
     * ==========================
     * Este método consiste en mostrar todas las entregas que ha realizado un usuario estudiante.
     */
    public function misEntregas() {
        $user = Auth::user();

        $entregas = Entrega::join('tareas', 'entregas.tarea_id', '=', 'tareas.id')
            ->where('estudiante_id', $user->id)
            ->select('entregas.*', 'tareas.titulo as tarea_titulo', 'tareas.recompensa as tarea_recompensa')
            ->get();
            
        return response()->json($entregas);
    }

    /*
     * GetTareasByProfesor
     * ===========================
     * Este método, como su propio nombre indica, sirve para buscar las tareas creadas por un profesor específico. Al igual que
     * ultimasTareas, se mostrarán las 3 últimas tareas creadas. En el caso de que haya cualquier error, se lanzará una
     * excepción mostrando el mensaje del motivo por el que no se han podido recuperar dichas tareas.
     */
    public function getTareasByProfesor(int $profesorId) {
        $estudianteId = Auth::id();

        try {
            $tareas = Tarea::where('creador_id', $profesorId)
                ->whereDate('fecha', '>=', now()->toDateString())
                ->whereDoesntHave('entregas', function ($query) use ($estudianteId) {
                    $query->where('estudiante_id', $estudianteId);
                })
                ->latest()
                ->when($estudianteId, function ($query) use ($estudianteId) {
                    $query->with(['entregas' => function ($q) use ($estudianteId) {
                        $q->where('estudiante_id', $estudianteId)
                            ->latest()
                            ->limit(1);
                    }]);
                })
                ->get();

            $tareasConEstado = $tareas->map(function ($tarea) {
                $entrega = $tarea->entregas->first();

                $tareaArray = $tarea->toArray();

                $tareaArray['estado_entrega'] = $entrega ? $entrega->estado : 'PENDIENTE';
                $tareaArray['entrega_id'] = $entrega ? $entrega->id : null;
                unset($tareaArray['entregas']);

                return $tareaArray;
            });

            return response()->json($tareasConEstado, 200);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'No se pudieron recuperar las tareas.',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
