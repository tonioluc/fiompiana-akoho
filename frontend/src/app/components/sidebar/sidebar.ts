/**
 * Composant Sidebar — menu de navigation latéral.
 *
 * ➜ Vue.js : équivalent d'un composant Sidebar.vue
 *     <template>...</template>
 *     <script setup>
 *       import { RouterLink } from 'vue-router'
 *     </script>
 *
 * ➜ Angular : le composant est déclaré avec @Component qui lie :
 *     - selector : le nom de la balise HTML (<app-sidebar>)
 *     - templateUrl : le fichier HTML du template
 *     - styleUrl : le fichier CSS
 *     - imports : les autres composants/directives utilisés dans le template
 *
 * DIFFÉRENCE CLÉ avec Vue.js :
 * En Vue, tu importes les composants dans <script> et ils sont auto-disponibles dans <template>.
 * En Angular, tu dois les lister dans le tableau 'imports' du @Component.
 */

import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',          // ← Le nom de la balise HTML : <app-sidebar></app-sidebar>
  imports: [RouterLink, RouterLinkActive],  // ← Directives utilisées dans le template
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  /**
   * Liste des éléments du menu.
   * Chaque élément a un label, une icône Bootstrap Icons et un lien routeur.
   *
   * ➜ Vue.js : tu mettrais ça dans un ref() ou directement dans le template
   * ➜ Angular : on déclare les données comme propriétés de la classe
   */
  menuItems = [
    { label: 'Races', icon: 'bi-tags', route: '/races' },
    { label: 'Description Races', icon: 'bi-card-list', route: '/description-races' },
    { label: 'Lots de Poulets', icon: 'bi-box-seam', route: '/lots-akoho' },
    { label: 'Poulets Morts', icon: 'bi-heartbreak', route: '/akoho-maty' },
    { label: 'Recenser Œufs', icon: 'bi-box-seam', route: '/lots-atody' },
    { label: 'Œufs Pourris', icon: 'bi-x-circle', route: '/atody-lamokany' },
    { label: 'Naissance Poussins', icon: 'bi-egg', route: '/naissances-oeuf' },
    { label: 'Situation Lots', icon: 'bi-bar-chart-line', route: '/situation-lots' },
  ];
}
