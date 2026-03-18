import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LotAkohoService } from '../../services/lot-akoho.service';
import { RaceService } from '../../services/race.service';
import { LotAkoho } from '../../models/lot-akoho.model';
import { Race } from '../../models/race.model';

@Component({
  selector: 'app-lot-akoho',
  imports: [CommonModule, FormsModule],
  templateUrl: './lot-akoho.html',
  styleUrl: './lot-akoho.css'
})
export class LotAkohoComponent implements OnInit {

  private lotAkohoService = inject(LotAkohoService);
  private raceService = inject(RaceService);

  lotsAkoho = signal<LotAkoho[]>([]);
  races = signal<Race[]>([]);
  formData: LotAkoho = this.getEmptyForm();
  formMode: 'create' | 'edit' = 'create';
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.loadAll();
    this.loadRaces();
  }

  loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.lotAkohoService.getAll().subscribe({
      next: (data) => {
        this.lotsAkoho.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors du chargement des lots de poulets.');
        this.loading.set(false);
        console.error('Erreur chargement:', err);
      }
    });
  }

  loadRaces(): void {
    this.raceService.getAll().subscribe({
      next: (data) => this.races.set(data),
      error: (err) => console.error('Erreur chargement races:', err)
    });
  }

  getRaceName(idRace: number): string {
    const race = this.races().find(r => r.Id_race === idRace);
    return race ? race.nom : `Race #${idRace}`;
  }

  prepareCreate(): void {
    this.formMode = 'create';
    this.formData = this.getEmptyForm();
    this.clearMessages();
  }

  prepareEdit(item: LotAkoho): void {
    this.formMode = 'edit';
    this.formData = { ...item };
    if (this.formData.date_entree) {
      this.formData.date_entree = this.formData.date_entree.substring(0, 10);
    }
    this.clearMessages();
  }

  save(): void {
    this.clearMessages();

    if (this.formData.nombre_akoho_vavy < 0 || this.formData.nombre_akoho_vavy > this.formData.nombre) {
      this.errorMessage.set('Le nombre de poules femelles doit être entre 0 et le nombre total de poulets.');
      return;
    }

    if (this.formMode === 'create') {
      this.lotAkohoService.create(this.formData).subscribe({
        next: () => {
          this.successMessage.set('Lot de poulets créé avec succès !');
          this.loadAll();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erreur lors de la création.');
          console.error('Erreur création:', err);
        }
      });
    } else {
      this.lotAkohoService.update(this.formData.Id_lot_akoho!, this.formData).subscribe({
        next: () => {
          this.successMessage.set('Lot de poulets modifié avec succès !');
          this.loadAll();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erreur lors de la modification.');
          console.error('Erreur modification:', err);
        }
      });
    }
  }

  deleteItem(item: LotAkoho): void {
    if (!confirm(`Voulez-vous vraiment supprimer le lot n°${item.numero} ?`)) {
      return;
    }

    this.clearMessages();

    this.lotAkohoService.delete(item.Id_lot_akoho!).subscribe({
      next: () => {
        this.successMessage.set('Lot de poulets supprimé avec succès !');
        this.loadAll();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors de la suppression.');
        console.error('Erreur suppression:', err);
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  }

  private getEmptyForm(): LotAkoho {
    return {
      Id_lot_akoho: null,
      numero: 0,
      date_entree: '',
      nombre: 0,
      age: 0,
      nombre_akoho_vavy: 0,
      prix_achat: 0,
      Id_race: 0
    };
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private closeModal(): void {
    const modalElement = document.getElementById('lotAkohoFormModal');
    if (modalElement) {
      const bootstrap = (window as any)['bootstrap'];
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
}
