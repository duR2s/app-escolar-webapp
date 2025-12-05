import { Component, OnInit } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MateriasService } from 'src/app/services/materias.service'; // 1. Importar servicio
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {

  //Agregar chartjs-plugin-datalabels
  //Variables
  public total_user: any = {};

  //Histograma (Registro de materias por día)
  lineChartData: ChartConfiguration['data'] = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0], // Inicializamos en 0
        label: 'Registro de materias',
        backgroundColor: '#F88406',
        borderColor: '#F88406',
        pointBackgroundColor: '#000',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        fill: 'origin',
      }
    ]
  };
  lineChartOption: ChartConfiguration['options'] = {
    responsive: false
  };
  lineChartPlugins = [DatalabelsPlugin];

  //Barras
  barChartData: ChartConfiguration['data'] = {
    labels: ["Congreso", "FePro", "Presentación Doctoral", "Feria Matemáticas", "T-System"],
    datasets: [
      {
        data: [34, 43, 54, 28, 74],
        label: 'Eventos Académicos',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
          '#FB82F5',
          '#2AD84A'
        ]
      }
    ]
  };
  barChartOption: ChartConfiguration['options'] = {
    responsive: false
  };
  barChartPlugins = [DatalabelsPlugin];

  // --- CIRCULAR (PIE) ---
  pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731']
      }
    ]
  };
  pieChartOption: ChartConfiguration['options'] = {
    responsive: false,
    maintainAspectRatio: false
  };
  pieChartPlugins = [DatalabelsPlugin];


  // --- DOUGHNUT ---
  doughnutChartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: ['#F88406', '#FCFF44', '#31E7E7']
      }
    ]
  };
  doughnutChartOption: ChartConfiguration['options'] = {
    responsive: false,
    maintainAspectRatio: false
  };
  doughnutChartPlugins = [DatalabelsPlugin];


  constructor(
    private administradoresServices: AdministradoresService,
    private materiasService: MateriasService // 2. Inyectar servicio
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
    this.obtenerDatosMaterias(); // 3. Llamar a la función al iniciar
  }

  public obtenerTotalUsers() {
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response: any) => {
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);

        // Extraer datos
        const admins = response.admins;
        const maestros = response.maestros;
        const alumnos = response.alumnos;

        // Actualizar PIE CHART
        this.pieChartData = {
          ...this.pieChartData,
          datasets: [
            {
              ...this.pieChartData.datasets[0],
              data: [admins, maestros, alumnos]
            }
          ]
        };

        // Actualizar DOUGHNUT CHART
        this.doughnutChartData = {
          ...this.doughnutChartData,
          datasets: [
            {
              ...this.doughnutChartData.datasets[0],
              data: [admins, maestros, alumnos]
            }
          ]
        };

      }, (error) => {
        console.log("Error al obtener total de usuarios ", error);
        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }

  // 4. Nueva lógica para obtener materias y procesar días
  public obtenerDatosMaterias() {
    this.materiasService.obtenerListaMaterias().subscribe(
      (response: any) => {
        console.log("Materias obtenidas para gráfica: ", response);
        this.procesarDias(response);
      },
      (error) => {
        console.log("Error al obtener materias: ", error);
      }
    );
  }

  private procesarDias(materias: any[]) {
    // Inicializar contadores: [Dom, Lun, Mar, Mie, Jue, Vie, Sab]
    // Indices coinciden con labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const contadores = [0, 0, 0, 0, 0, 0, 0];

    materias.forEach((materia) => {
      let dias: string[] = [];

      // Asegurar que dias_json sea un array
      if (typeof materia.dias_json === 'string') {
        try {
          dias = JSON.parse(materia.dias_json);
        } catch (e) {
          dias = [];
        }
      } else if (Array.isArray(materia.dias_json)) {
        dias = materia.dias_json;
      }

      // Recorrer los días de esta materia y sumar al contador correspondiente
      dias.forEach((dia) => {
        // Normalizamos a minúsculas y quitamos acentos para comparar mejor
        const diaNormalizado = dia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        switch (diaNormalizado) {
          case 'domingo':
            contadores[0]++; // Sun
            break;
          case 'lunes':
            contadores[1]++; // Mon
            break;
          case 'martes':
            contadores[2]++; // Tue
            break;
          case 'miercoles':
            contadores[3]++; // Wed
            break;
          case 'jueves':
            contadores[4]++; // Thu
            break;
          case 'viernes':
            contadores[5]++; // Fri
            break;
          case 'sabado':
            contadores[6]++; // Sat
            break;
        }
      });
    });

    console.log("Contadores de días calculados: ", contadores);

    // Actualizar la gráfica (Se usa spread operator para disparar la detección de cambios de Angular/Chart.js)
    this.lineChartData = {
      ...this.lineChartData,
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: contadores
        }
      ]
    };
  }
}
