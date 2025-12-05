import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Location } from '@angular/common';
import { MaestrosService } from 'src/app/services/maestros.service';
import { FacadeService } from 'src/app/services/facade.service';
import { Router } from '@angular/router';
// 1. Importamos el servicio de materias
import { MateriasService } from 'src/app/services/materias.service';

@Component({
  selector: 'app-registro-materias',
  templateUrl: './registro-materias.component.html',
  styleUrls: ['./registro-materias.component.scss']
})
export class RegistroMateriasComponent implements OnInit, OnChanges {
  @Input() datos_materia: any = {};
  @Input() editar: boolean = false;

  public materia: any = {};
  public errors: any = {};
  public lista_maestros: any[] = [];
  public token: string = "";

  // ==========================================
  // Propiedades para el TimePicker (Español)
  // ==========================================
  public timePickerTheme = {
    container: {
      bodyBackgroundColor: '#fff',
      buttonColor: '#0092B8'
    },
    dial: {
      dialBackgroundColor: '#0092B8',
    },
    clockFace: {
      clockFaceBackgroundColor: '#f0f0f0',
      clockHandColor: '#0092B8',
      clockFaceTimeInactiveColor: '#6c757d'
    }
  };

  public labelCancelar: string = "Cancelar";
  public labelAceptar: string = "Aceptar";

  // CORRECCIÓN AQUÍ:
  // El 'value' debe coincidir con la clave definida en models.py (ICC, LCC, ITI)
  // El 'viewValue' es lo que ve el usuario en el select.
  public programas: any[] = [
    { value: 'ICC', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: 'LCC', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: 'ITI', viewValue: 'Ingeniería en Tecnologías de la Información' }
  ];

  public dias_semana: any[] = [
    { value: 'Lunes', nombre: 'Lunes' },
    { value: 'Martes', nombre: 'Martes' },
    { value: 'Miércoles', nombre: 'Miércoles' },
    { value: 'Jueves', nombre: 'Jueves' },
    { value: 'Viernes', nombre: 'Viernes' },
    { value: 'Sábado', nombre: 'Sábado' }
  ];

  constructor(
    private location: Location,
    private maestrosService: MaestrosService,
    private facadeService: FacadeService,
    private router: Router,
    // 2. Inyectamos el servicio en el constructor
    private materiasService: MateriasService
  ) { }

  ngOnInit(): void {
    this.token = this.facadeService.getSessionToken();
    this.obtenerMaestros();

    if (this.editar && this.datos_materia) {
      this.materia = { ...this.datos_materia };
      // Corrección de formato de hora (HH:mm:ss -> HH:mm)
      this.formatearHoras();
      this.parsearDias();
    } else {
      const horaActualMX = this.obtenerHoraActualMexico();
      // Usamos el esquema del servicio o inicializamos manual
      this.materia = this.materiasService.esquemaMateria();
      this.materia.hora_inicio = horaActualMX;
      this.materia.dias_json = [];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos_materia'] && changes['datos_materia'].currentValue) {
      if (this.editar && Object.keys(changes['datos_materia'].currentValue).length > 0) {
        this.materia = { ...changes['datos_materia'].currentValue };
        // Corrección de formato de hora para actualizaciones dinámicas
        this.formatearHoras();
        this.parsearDias();
        console.log("Datos actualizados dinámicamente en Materias (ngOnChanges):", this.materia);
      }
    }
  }

  /**
   * Elimina los segundos (si existen) de las horas para que los inputs
   * HTML type="time" o TimePickers puedan leer el valor correctamente.
   * Transforma "12:00:00" -> "12:00"
   */
  private formatearHoras() {
    if (this.materia.hora_inicio && this.materia.hora_inicio.split(':').length === 3) {
      this.materia.hora_inicio = this.materia.hora_inicio.substring(0, 5);
    }
    if (this.materia.hora_fin && this.materia.hora_fin.split(':').length === 3) {
      this.materia.hora_fin = this.materia.hora_fin.substring(0, 5);
    }
  }

  private parsearDias() {
    if (typeof this.materia.dias_json === 'string') {
      try {
        this.materia.dias_json = JSON.parse(this.materia.dias_json);
      } catch (e) {
        this.materia.dias_json = [];
      }
    }
  }

  public obtenerHoraActualMexico(): string {
    const ahora = new Date();
    const opciones: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Mexico_City',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Intl.DateTimeFormat('es-MX', opciones).format(ahora);
  }

  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response.map((m: any) => ({
          id: m.id,
          nombreCompleto: `${m.user.first_name} ${m.user.last_name}`,
          id_trabajador: m.id_trabajador
        }));
      },
      (error) => console.error("Error al obtener maestros", error)
    );
  }

  public checkboxChange(event: any) {
    if (event.checked) {
      this.materia.dias_json.push(event.source.value);
    } else {
      const index = this.materia.dias_json.indexOf(event.source.value);
      if (index > -1) {
        this.materia.dias_json.splice(index, 1);
      }
    }
  }

  public revisarSeleccion(dia: string): boolean {
    return this.materia.dias_json ? this.materia.dias_json.includes(dia) : false;
  }

  public regresar() {
    this.location.back();
  }

  // 3. Método registrar con lógica real
  public registrar() {
    // Validamos usando el servicio (igual que en maestros)
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);

    // --- VALIDACIÓN ADICIONAL DE HORA ---
    if(this.materia.hora_inicio && this.materia.hora_fin){
      const [horaInicio, minInicio] = this.materia.hora_inicio.split(':').map(Number);
      const [horaFin, minFin] = this.materia.hora_fin.split(':').map(Number);

      const totalMinutosInicio = (horaInicio * 60) + minInicio;
      const totalMinutosFin = (horaFin * 60) + minFin;

      if(totalMinutosInicio >= totalMinutosFin){
        this.errors['horario'] = "La hora de inicio debe ser anterior a la hora de fin.";
      }
    }

    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Llamada al servicio
    this.materiasService.registrarMateria(this.materia).subscribe(
      (response) => {
        alert("Materia registrada correctamente");
        console.log("Materia registrada: ", response);
        this.router.navigate(['/materias']);
      },
      (error) => {
        alert("Error al registrar la materia");
        console.error("Error al registrar materia: ", error);
      }
    );
  }

  // 4. Método actualizar con lógica real
  public actualizar() {
    // Validamos usando el servicio
    this.errors = {};
    this.errors = this.materiasService.validarMateria(this.materia, this.editar);

    // --- VALIDACIÓN ADICIONAL DE HORA ---
    if(this.materia.hora_inicio && this.materia.hora_fin){
      const [horaInicio, minInicio] = this.materia.hora_inicio.split(':').map(Number);
      const [horaFin, minFin] = this.materia.hora_fin.split(':').map(Number);

      const totalMinutosInicio = (horaInicio * 60) + minInicio;
      const totalMinutosFin = (horaFin * 60) + minFin;

      if(totalMinutosInicio >= totalMinutosFin){
        this.errors['horario'] = "La hora de inicio debe ser anterior a la hora de fin.";
      }
    }

    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    // Llamada al servicio
    this.materiasService.editarMateria(this.materia).subscribe(
      (response) => {
        alert("Materia actualizada correctamente");
        console.log("Materia actualizada: ", response);
        this.router.navigate(['/materias']);
      },
      (error) => {
        alert("Error al actualizar la materia");
        console.error("Error al actualizar materia: ", error);
      }
    );
  }

  public soloNumeros(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 65 && charCode <= 90) &&
      !(charCode >= 97 && charCode <= 122) &&
      charCode !== 32 &&
      charCode !== 241 && charCode !== 209
    ) {
      event.preventDefault();
    }
  }

  public soloAlfanumericos(event: KeyboardEvent) {
    // Expresión regular que permite:
    // a-z A-Z (Letras)
    // 0-9 (Números)
    // áéíóúÁÉÍÓÚüÜ (Acentos y diéresis)
    // ñÑ (Letra ñ)
    // \s (Espacios en blanco)
    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]*$/;

    // Si la tecla presionada (event.key) NO coincide con el regex, prevenimos la escritura
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
}
}
