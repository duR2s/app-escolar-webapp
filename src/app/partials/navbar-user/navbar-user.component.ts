import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-navbar-user',
  templateUrl: './navbar-user.component.html',
  styleUrls: ['./navbar-user.component.scss']
})
export class NavbarUserComponent implements OnInit {

  public userInitial: string = '';
  public isMobileView: boolean = window.innerWidth <= 992;
  public showUserMenu: boolean = false;
  public mobileOpen: boolean = false;
  public userRole: string = '';
  // Variable para controlar qué menú está expandido (si usas lógica manual en móvil o desktop)
  public expandedMenu: string | null = null;

  // Estas variables se utilizarán por si se habilita el tema oscuro
  paletteMode: 'light' | 'dark' = 'light';
  colorPalettes = {
    light: {
      '--background-main': '#f4f7fb',
      '--sidebar-bg': '#23395d',
      '--navbar-bg': '#fff',
      '--text-main': '#222',
      '--table-bg': '#fff',
      '--table-header-bg': '#cfe2ff',
    },
    dark: {
      '--background-main': '#181a1b',
      '--sidebar-bg': '#1a2636',
      '--navbar-bg': '#222',
      '--text-main': '#e4ecfa',
      '--table-bg': '#222',
      '--table-header-bg': '#30507a',
    }
  };

  constructor(private router: Router, public facadeService: FacadeService) {
    // Obtenemos el rol del usuario y la inicial del nombre
    const name = this.facadeService.getUserCompleteName();
    if (name && name.length > 0) {
      this.userInitial = name.trim()[0].toUpperCase();
    } else {
      this.userInitial = '?';
    }
    this.userRole = this.facadeService.getUserGroup();

    // Configuración inicial de paleta y resize
    this.paletteMode = 'light';
    const palette = this.colorPalettes['light'];
    Object.keys(palette).forEach(key => {
      document.documentElement.style.setProperty(key, palette[key]);
    });
  }

  ngOnInit(): void {
    this.userRole = this.facadeService.getUserGroup();
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobileView = window.innerWidth <= 992;
    if (!this.isMobileView) {
      this.mobileOpen = false;
    }
  }

  togglePalette() {
    this.paletteMode = this.paletteMode === 'light' ? 'dark' : 'light';
    const palette = this.colorPalettes[this.paletteMode];
    Object.keys(palette).forEach(key => {
      document.documentElement.style.setProperty(key, palette[key]);
    });
  }

  toggleSidebar() {
    this.mobileOpen = !this.mobileOpen;
  }

  closeSidebar() {
    this.mobileOpen = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  // Funciones para manejar la expansión de menús (si el HTML lo requiere)
  toggleMenu(menuName: string) {
    if (this.expandedMenu === menuName) {
      this.expandedMenu = null;
    } else {
      this.expandedMenu = menuName;
    }
  }

  closeMenu() {
    this.expandedMenu = null;
  }

  // Actualizar ruta de edición para usar la nueva estructura de rutas internas
  editUser() {
    const userId = this.facadeService.getUserId();
    const userRole = this.facadeService.getUserGroup();
    // Navegamos a la nueva ruta interna del dashboard '/registro/'
    this.router.navigate([`/registro/${userRole}/${userId}`]);
    this.showUserMenu = false;
  }

  logout() {
    this.facadeService.logout().subscribe(
      () => {
        this.facadeService.destroyUser();
        this.router.navigate(['/login']);
        this.closeSidebar();
      },
      () => {
        this.facadeService.destroyUser();
        this.router.navigate(['/login']);
        this.closeSidebar();
      }
    );
  }

  // --- Helpers de Roles (Usados en el HTML) ---

  isAdmin(): boolean {
    return this.userRole === 'administrador';
  }

  isTeacher(): boolean {
    return this.userRole === 'maestro';
  }

  isStudent(): boolean {
    return this.userRole === 'alumno';
  }

  canSeeAdminItems(): boolean {
    return this.isAdmin();
  }

  canSeeTeacherItems(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  canSeeStudentItems(): boolean {
    return this.isAdmin() || this.isTeacher() || this.isStudent();
  }

  canSeeHomeItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  canSeeRegisterItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

}
