import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { MateriasService } from 'src/app/services/materias.service';
// Importamos el componente modal que ahora existe en el entorno
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-materias-screen',
  templateUrl: './materias-screen.component.html',
  styleUrls: ['./materias-screen.component.scss']
})
export class MateriasScreenComponent implements OnInit, AfterViewInit {
  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_materias: any[] = [];

  // Para la tabla de Angular Material
  displayedColumns: string[] = ['nrc', 'nombre', 'seccion', 'dias', 'horario', 'salon', 'profesor', 'programa', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosMateria>(this.lista_materias as DatosMateria[]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public facadeService: FacadeService,
    private materiasService: MateriasService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    // Validar login
    this.token = this.facadeService.getSessionToken();
    if(this.token == ""){
      this.router.navigate(["/"]);
    }

    // Obtener materias
    this.obtenerMaterias();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public obtenerMaterias() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response) => {
        this.lista_materias = response;
        console.log("Lista materias: ", this.lista_materias);
        // Actualizar el dataSource de Angular Material
        if (this.lista_materias.length > 0) {
          this.dataSource.data = this.lista_materias as DatosMateria[];
        }
      }, (error) => {
        alert("No se pudo obtener la lista de materias");
      }
    );
  }

  public goEditar(idMateria: number) {
    // Permiso simple de administrador
    if (this.rol === 'administrador') {

      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idMateria, rol: 'materia', tipo: 'update'},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        // LÓGICA MOVIDA AQUÍ
        if(result === true){
          this.router.navigate(["registro/materias/" + idMateria]);
        }
      });
    } else {
      alert("No tienes permisos para editar materias.");
    }
    ///////////////
  }

  public delete(idMateria: number) {
    // Permiso simple de administrador
    if (this.rol === 'administrador') {

      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idMateria, rol: 'materia', tipo: 'delete'},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        // LÓGICA MOVIDA AQUÍ
        if(result === true){
          // Llamamos al servicio de materias, no al de usuarios
          this.materiasService.eliminarMateria(idMateria).subscribe(
            (response) => {
              console.log("Materia eliminada");
              alert("Materia eliminada correctamente.");
              window.location.reload();
            },
            (error) => {
               alert("Error al eliminar la materia");
            }
          );
        }
      });
    } else {
      alert("No tienes permisos para eliminar materias.");
    }
  }

  // Función auxiliar para formatear los días
  public formatearDias(dias: any): string {
    if (Array.isArray(dias)) {
      return dias.join(', ');
    }
    return dias;
  }

  public isAdmin(): boolean {
    if (this.rol === 'administrador') {
      return true;
    } else {
      return false;
    }
  }

}

// Interface para tipado de datos de la tabla
export interface DatosMateria {
  id: number;
  nrc: number;
  nombre: string;
  seccion: number;
  dias_json: any;
  hora_inicio: string;
  hora_fin: string;
  salon: string;
  profesor_nombre: string;
  programa_educativo: string;
}
