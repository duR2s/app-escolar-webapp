import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class MateriasService {

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService,
    private validatorService: ValidatorService,
    private errorService: ErrorsService
  ) { }

public esquemaMateria() {
    return {
      'id': '',
      'nrc': '',
      'nombre': '',
      'seccion': '',
      'dias_json': [],
      'hora_inicio': '',
      'hora_fin': '',
      'salon': '',
      'programa_educativo': '',
      'profesor': '',
      'creditos': ''
    }
}

  // Validación
  public validarMateria(data: any, editar: boolean) {
    console.log("Validando materia... ", data);
    let error: any = [];

    if (!this.validatorService.required(data["nrc"])) {
      error["nrc"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["nombre"])) {
      error["nombre"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["seccion"])) {
      error["seccion"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["dias_json"]) || data["dias_json"].length === 0) {
      error["dias_json"] = "Debes seleccionar al menos un día";
    }

    if (!this.validatorService.required(data["hora_inicio"])) {
      error["hora_inicio"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["hora_fin"])) {
      error["hora_fin"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["salon"])) {
      error["salon"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["programa_educativo"])) {
      error["programa_educativo"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["profesor"])) {
      error["profesor"] = this.errorService.required;
    }

    if (!this.validatorService.required(data["creditos"])) {
      error["creditos"] = this.errorService.required;
    }

    return error;
  }

  // --- SERVICIOS HTTP ---

  public registrarMateria(materia: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return this.http.post<any>(`${environment.url_api}/materias/`, materia, { headers });
  }

  public obtenerListaMaterias(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return this.http.get<any>(`${environment.url_api}/lista-materias/`, { headers });
  }

  public obtenerMateria(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return this.http.get<any>(`${environment.url_api}/materias/?id=${id}`, { headers });
  }

  public editarMateria(materia: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return this.http.put<any>(`${environment.url_api}/materias/`, materia, { headers });
  }

  public eliminarMateria(id: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;

    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    return this.http.delete<any>(`${environment.url_api}/materias/?id=${id}`, { headers });
  }
}

// Interfaz definida al final del archivo
export interface Materia {
  id?: number;
  nrc: number;
  nombre: string;
  seccion: number;
  dias_json: string[];
  hora_inicio: string;
  hora_fin: string;
  salon: string;
  programa_educativo: string;
  profesor: number;
  creditos: number;
}
