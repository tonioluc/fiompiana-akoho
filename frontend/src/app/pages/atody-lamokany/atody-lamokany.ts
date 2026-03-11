import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AtodyLamokanyService } from '../../services/atody-lamokany.service';
import { LotAtodyService } from '../../services/lot-atody.service';
import { AtodyLamokany } from '../../models/atody-lamokany.model';
import { LotAtody } from '../../models/lot-atody.model';

@Component({
  selector: 'app-atody-lamokany',
  imports: [CommonModule, FormsModule],
  templateUrl: './atody-lamokany.html',
  styleUrl: './atody-lamokany.css'
})
export class AtodyLamokanyComponent implements OnInit {

  private atodyLamokanyService = inject(AtodyLamokanyService);
  private lotAtodyService = inject(LotAtodyService);

  items = signal<AtodyLamokany[]>([]);
  lotsAtody = signal<LotAtody[]>([]);
  lotsAtodyMap = signal(new Map<number, LotAtody>());

  formData: AtodyLamokany = this.getEmptyForm();
  formNumeroLotAtody: number | null = null;
  lotLookupError = signal('');
  formMode: 'create' | 'edit' = 'create';
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.loadAll();
    this.loadLotsAtody();
  }

  loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.atodyLamokanyService.getAll().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
        this.loadLotsInfoForItems();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors du chargement des données.');
        this.loading.set(false);
        console.error('Erreur chargement:', err);
      }
    });
  }

  loadLotsAtody(): void {
    this.lotAtodyService.getAll().subscribe({
      next: (data) => {
        this.lotsAtody.set(data);
        const map = new Map<number, LotAtody>();
        data.forEach(lot => map.set(lot.Id_lot_atody!, lot));
        this.lotsAtodyMap.set(map);
      },
      error: (err) => console.error('Erreur chargement lots atody:', err)
    });
  }

  loadLotsInfoForItems(): void {
    const uniqueIds = [...new Set(this.items().map(i => i.Id_lot_atody))];
    uniqueIds.forEach(id => {
      if (!this.lotsAtodyMap().has(id)) {
        this.lotAtodyService.getById(id).subscribe({
          next: (lot) => {
            this.lotsAtodyMap.update(map => {
              const newMap = new Map(map);
              newMap.set(id, lot);
              return newMap;
            });
          },
          error: () => {}
        });
      }
    });
  }

  getLotAtodyNumero(idLotAtody: number): string {
    const lot = this.lotsAtodyMap().get(idLotAtody);
    return lot ? `Lot œufs n°${lot.numero}` : `Lot #${idLotAtody}`;
  }

  prepareCreate(): void {
    this.formMode = 'create';
    this.formData = this.getEmptyForm();
    this.formNumeroLotAtody = null;
    this.lotLookupError.set('');
    this.clearMessages();
  }

  prepareEdit(item: AtodyLamokany): void {
    this.formMode = 'edit';
    this.formData = { ...item };
    if (this.formData.date_lamokany) {
      this.formData.date_lamokany = this.formData.date_lamokany.substring(0, 10);
    }
    const lot = this.lotsAtodyMap().get(item.Id_lot_atody);
    this.formNumeroLotAtody = lot ? lot.numero : null;
    this.lotLookupError.set('');
    this.clearMessages();
  }

  save(): void {
    this.clearMessages();
    this.lotLookupError.set('');

    if (!this.formNumeroLotAtody) {
      this.lotLookupError.set('Veuillez saisir un numéro de lot d\'œufs.');
      return;
    }

    const lotAtody = this.lotsAtody().find(l => l.numero === this.formNumeroLotAtody);
    if (!lotAtody || !lotAtody.Id_lot_atody) {
      this.lotLookupError.set(`Aucun lot d'œufs trouvé avec le numéro ${this.formNumeroLotAtody}.`);
      return;
    }

    this.formData.Id_lot_atody = lotAtody.Id_lot_atody;
    this.doSave();
  }

  private doSave(): void {
    if (this.formMode === 'create') {
      this.atodyLamokanyService.create(this.formData).subscribe({
        next: () => {
          this.successMessage.set('Œuf pourri enregistré avec succès !');
          this.loadAll();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erreur lors de la création.');
          console.error('Erreur création:', err);
        }
      });
    } else {
      this.atodyLamokanyService.update(this.formData.Id_atody_lamokany!, this.formData).subscribe({
        next: () => {
          this.successMessage.set('Enregistrement modifié avec succès !');
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

  deleteItem(item: AtodyLamokany): void {
    if (!confirm(`Voulez-vous vraiment supprimer l'enregistrement #${item.Id_atody_lamokany} ?`)) {
      return;
    }

    this.clearMessages();

    this.atodyLamokanyService.delete(item.Id_atody_lamokany!).subscribe({
      next: () => {
        this.successMessage.set('Enregistrement supprimé avec succès !');
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

  private getEmptyForm(): AtodyLamokany {
    return {
      Id_atody_lamokany: null,
      date_lamokany: '',
      nombre: 0,
      Id_lot_atody: 0
    };
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private closeModal(): void {
    const modalElement = document.getElementById('atodyLamokanyFormModal');
    if (modalElement) {
      const bootstrap = (window as any)['bootstrap'];
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }
}
