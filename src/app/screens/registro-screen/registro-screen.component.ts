import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MateriasService } from 'src/app/services/materias.service'; // Servicio importado

@Component({
  selector: 'app-registro-screen',
  templateUrl: './registro-screen.component.html',
  styleUrls: ['./registro-screen.component.scss']
})
export class RegistroScreenComponent implements OnInit {

  public rol: string = "";
  public idUser: number = 0;
  public editar: boolean = false;
  public user: any = {}; // Este objeto guardará tanto Usuarios como Materias según el caso

  // Banderas para mostrar el partial correcto
  public isAdmin: boolean = false;
  public isMaestro: boolean = false;
  public isAlumno: boolean = false;
  public isMateria: boolean = false;

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
    private materiasService: MateriasService // Servicio inyectado
  ) { }

  ngOnInit(): void {
    // SUSCRIPCIÓN A CAMBIOS DE RUTA
    this.activatedRoute.params.subscribe(params => {
      // 1. Actualizar Rol
      if (params['rol']) {
        this.rol = params['rol'];
        this.detectarRol();
      }

      // 2. Actualizar ID y Modo Edición
      if (params['id']) {
        this.idUser = params['id'];
        this.editar = true;
        this.obtenerDatosEdicion();
      } else {
        // Si no hay ID, estamos en modo Registro "limpio"
        this.idUser = 0;
        this.editar = false;
        this.user = {};
      }
    });
  }

  private detectarRol() {
    // Reseteamos todas las banderas primero
    this.isAdmin = false;
    this.isMaestro = false;
    this.isAlumno = false;
    this.isMateria = false;

    switch (this.rol) {
      case 'administrador':
        this.isAdmin = true;
        break;
      case 'maestro':
        this.isMaestro = true;
        break;
      case 'alumno':
        this.isAlumno = true;
        break;
      case 'materias':
        this.isMateria = true;
        break;
      default:
        console.warn("Rol no reconocido o acceso directo inválido: ", this.rol);
        break;
    }
  }

  public obtenerDatosEdicion() {
    console.log("Obteniendo datos para editar: ", this.rol, this.idUser);

    // Uso de SWITCH CASE para manejar la lógica de obtención de datos
    switch (this.rol) {
      case 'administrador':
        this.administradoresService.obtenerAdminPorID(this.idUser).subscribe(
          (response) => {
            this.user = response;
            console.log("Usuario original obtenido: ", this.user);
          // Asignar datos, soportando respuesta plana o anidada
          this.user.first_name = response.user?.first_name || response.first_name;
          this.user.last_name = response.user?.last_name || response.last_name;
          this.user.email = response.user?.email || response.email;
          this.user.tipo_usuario = this.rol;
          this.isAdmin = true;
        }, (error) => {
          console.log("Error: ", error);
          alert("No se pudo obtener el administrador seleccionado");
        }
        );
        break;

      case 'maestro':
          this.maestrosService.obtenerMaestroPorID(this.idUser).subscribe(
          (response) => {
            this.user = response;
            console.log("Usuario original obtenido: ", this.user);
            // Asignar datos, soportando respuesta plana o anidada
            this.user.first_name = response.user?.first_name || response.first_name;
            this.user.last_name = response.user?.last_name || response.last_name;
            this.user.email = response.user?.email || response.email;
            this.user.tipo_usuario = this.rol;
            this.isMaestro = true;
          }, (error) => {
            console.log("Error: ", error);
            alert("No se pudo obtener el maestro seleccionado");
          }
        );
        break;

      case 'alumno':
        this.alumnosService.obtenerAlumnoPorID(this.idUser).subscribe(
          (response) => {
            this.user = response;
            console.log("Usuario original obtenido: ", this.user);
            // Asignar datos, soportando respuesta plana o anidada
            this.user.first_name = response.user?.first_name || response.first_name;
            this.user.last_name = response.user?.last_name || response.last_name;
            this.user.email = response.user?.email || response.email;
            this.user.tipo_usuario = this.rol;
            this.isAlumno = true;
          }, (error) => {
            console.log("Error: ", error);
            alert("No se pudo obtener el alumno seleccionado");
          }
        );
        break;

      case 'materias':
        this.materiasService.obtenerMateria(this.idUser).subscribe(
          (response) => {
            // Las materias suelen venir en un objeto plano, pero asignamos directamente
            this.user = response;
            // Opcional: Si el backend devuelve una lista en lugar de un objeto único (depende de tu API)
            // if(Array.isArray(response) && response.length > 0) { this.user = response[0]; }

            console.log("Datos de materia obtenidos:", this.user);
          }, (error) => {
            console.error(error);
            alert("Error al obtener la materia seleccionada");
          }
        );
        break;

      default:
        console.warn("No se encontró un servicio para el rol:", this.rol);
        break;
    }
  }

  public goBack() {
    this.location.back();
  }
}
