import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { Router } from '@angular/router';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit {
  // Variables y métodos del componente
  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_admins: any[] = [];

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog

  ) { }

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }

    // Obtenemos los administradores
    this.obtenerAdmins();
  }

  //Obtener lista de usuarios
  public obtenerAdmins() {
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response) => {
        this.lista_admins = response;
        console.log("Lista users: ", this.lista_admins);
      }, (error) => {
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  public goEditar(idAdministrador: number) {
    // Permiso simple de administrador
    if (this.rol === 'administrador') {

      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idAdministrador, rol: 'administrador', tipo: 'update'},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        // LÓGICA MOVIDA AQUÍ
        if(result === true){
          this.router.navigate(["registro/administrador/" + idAdministrador]);
        }
      });
    } else {
      alert("No tienes permisos para editar Administrador.");
    }
    ///////////////
  }

  public delete(idAdministrador: number) {
    // Permiso simple de administrador
    if (this.rol === 'administrador') {

      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idAdministrador, rol: 'administrador', tipo: 'delete'},
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        // LÓGICA MOVIDA AQUÍ
        if(result === true){
          // Llamamos al servicio de materias, no al de usuarios
          this.administradoresService.eliminarAdmin(idAdministrador).subscribe(
            (response) => {
              console.log("Administrador eliminada");
              alert("Administrador eliminada correctamente.");
              window.location.reload();
            },
            (error) => {
               alert("Error al eliminar la administradores");
            }
          );
        }
      });
    } else {
      alert("No tienes permisos para eliminar administradores.");
    }
  }
}


