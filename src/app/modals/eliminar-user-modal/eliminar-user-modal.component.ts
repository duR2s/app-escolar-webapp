import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-eliminar-user-modal',
  templateUrl: './eliminar-user-modal.component.html',
  styleUrls: ['./eliminar-user-modal.component.scss']
})
export class EliminarUserModalComponent implements OnInit {

  public rol: string = "";
  public id: number | null = null;
  // Variable para controlar el tipo de acción: 'delete' | 'update'
  public tipo: string = "delete";

  constructor(
    private dialogRef: MatDialogRef<EliminarUserModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.rol = this.data.rol;
    this.id = this.data.id;
    // Si mandan el tipo lo usamos, si no, por defecto es delete
    this.tipo = this.data.tipo || "delete";
  }

  public cerrar_modal(){
    this.dialogRef.close(false);
  }

  public confirmar(){
    // Retornamos true para indicar que el usuario confirmó la acción (sea borrar o editar)
    this.dialogRef.close(true);
  }
}
