import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})
export class MaestrosScreenComponent implements AfterViewInit, OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];

  //Para la tabla
  displayedColumns: string[] = ['id_trabajador', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'cubiculo', 'area_investigacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>(this.lista_maestros as DatosUsuario[]);


  constructor(
    public facadeService: FacadeService,
    public maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog
  ) { }


  @ViewChild(MatPaginator)
  set matPaginator(p: MatPaginator) {
    this.dataSource.paginator = p;
  }
  @ViewChild(MatSort)
  set matSort(s: MatSort) {
    this.dataSource.sort = s;
  }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    //Obtener maestros
    this.obtenerMaestros();
  }

  ngAfterViewInit() {
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // Consumimos el servicio para obtener los maestros
  //Obtener maestros
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        console.log("Lista users: ", this.lista_maestros);
        if (this.lista_maestros.length > 0) {
          //Agregar datos del nombre e email
          this.lista_maestros.forEach(usuario => {
            usuario.nombre = usuario.user.first_name + " " + usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Maestros: ", this.lista_maestros);

          this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_maestros as DatosUsuario[]);
        }
      }, (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }

  public goEditar(idMaestro: number) {
    // Permiso simple de administrador
    if (this.rol === 'administrador') {

      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idMaestro, rol: 'maestro', tipo: 'update'},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        // LÓGICA MOVIDA AQUÍ
        if(result === true){
          this.router.navigate(["registro/maestros/" + idMaestro]);
        }
      });
    } else {
      alert("No tienes permisos para editar materias.");
    }
    ///////////////
  }

  public delete(idMaestro: number) {
    // Permiso simple de administrador
    if (this.rol === 'administrador') {

      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idMaestro, rol: 'maestro', tipo: 'delete'},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        // LÓGICA MOVIDA AQUÍ
        if(result === true){
          // Llamamos al servicio de de usuarios
          this.maestrosService.eliminarMaestro(idMaestro).subscribe(
            (response) => {
              console.log("Maestro eliminada");
              alert("Maestro eliminada correctamente.");
              window.location.reload();
            },
            (error) => {
               alert("Error al eliminar la maestro");
            }
          );
        }
      });
    } else {
      alert("No tienes permisos para eliminar maestros.");
    }
  }
}
//Esto va fuera de la llave que cierra la clase
export interface DatosUsuario {
  id: number,
  id_trabajador: number;
  nombre: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  cubiculo: string,
  area_investigacion: number,
}
