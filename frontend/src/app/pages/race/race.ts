import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RaceService } from '../../services/race.service';
import { Race } from '../../models/race.model';

@Component({
  selector: 'app-race',
  imports: [CommonModule, FormsModule],
  templateUrl: './race.html',
  styleUrl: './race.css'
})
export class RaceComponent implements OnInit {

  private raceService = inject(RaceService);

  races = signal<Race[]>([]);
  formData: Race = this.getEmptyForm();
  formMode: 'create' | 'edit' = 'create';
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.raceService.getAll().subscribe({
      next: (data) => {
        this.races.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors du chargement des races.');
        this.loading.set(false);
        console.error('Erreur chargement:', err);
      }
    });
  }

  prepareCreate(): void {
    this.formMode = 'create';
    this.formData = this.getEmptyForm();
    this.clearMessages();
  }

  prepareEdit(item: Race): void {
    this.formMode = 'edit';
    this.formData = { ...item };
    this.clearMessages();
  }

  save(): void {
    this.clearMessages();

    if (this.formMode === 'create') {
      this.raceService.create(this.formData).subscribe({
        next: () => {
          this.successMessage.set('Race créée avec succès !');
          this.loadAll();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erreur lors de la création.');
          console.error('Erreur création:', err);
        }
      });
    } else {
      this.raceService.update(this.formData.Id_race!, this.formData).subscribe({
        next: () => {
          this.successMessage.set('Race modifiée avec succès !');
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

  deleteItem(item: Race): void {
    if (!confirm(`Voulez-vous vraiment supprimer la race "${item.nom}" ?`)) {
      return;
    }

    this.clearMessages();

    this.raceService.delete(item.Id_race!).subscribe({
      next: () => {
        this.successMessage.set('Race supprimée avec succès !');
        this.loadAll();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors de la suppression.');
        console.error('Erreur suppression:', err);
      }
    });
  }

  private getEmptyForm(): Race {
    return {
      Id_race: null,
      nom: '',
      prix_sakafo: 0,
      prix_vente: 0,
      prix_vente_atody: 0,
      nombre_jour_foy: 0,
      capacite_pondaison: 0
    };
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private closeModal(): void {
    const modalElement = document.getElementById('raceFormModal');
    if (modalElement) {
      const bootstrap = (window as any)['bootstrap'];
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }
}
