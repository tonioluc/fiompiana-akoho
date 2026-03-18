import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LotAtodyService } from '../../services/lot-atody.service';
import { LotAkohoService } from '../../services/lot-akoho.service';
import { LotAtody } from '../../models/lot-atody.model';
import { LotAkoho } from '../../models/lot-akoho.model';

@Component({
  selector: 'app-lot-atody',
  imports: [CommonModule, FormsModule],
  templateUrl: './lot-atody.html',
  styleUrl: './lot-atody.css'
})
export class LotAtodyComponent implements OnInit {

  private lotAtodyService = inject(LotAtodyService);
  private lotAkohoService = inject(LotAkohoService);

  items = signal<LotAtody[]>([]);
  lotsAkohoMap = signal(new Map<number, LotAkoho>());
  formData: LotAtody = this.getEmptyForm();
  formNumeroLot: number | null = null;
  lotLookupError = signal('');
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

    this.lotAtodyService.getAll().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
        this.loadLotsInfo();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors du chargement des données.');
        this.loading.set(false);
        console.error('Erreur chargement:', err);
      }
    });
  }

  loadLotsInfo(): void {
    const uniqueIds = [...new Set(this.items().map(i => i.Id_lot_akoho))];
    uniqueIds.forEach(id => {
      if (!this.lotsAkohoMap().has(id)) {
        this.lotAkohoService.getById(id).subscribe({
          next: (lot) => {
            this.lotsAkohoMap.update(map => {
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

  getLotNumero(idLotAkoho: number): string {
    const lot = this.lotsAkohoMap().get(idLotAkoho);
    return lot ? `Lot n°${lot.numero}` : `Lot #${idLotAkoho}`;
  }

  prepareCreate(): void {
    this.formMode = 'create';
    this.formData = this.getEmptyForm();
    this.formNumeroLot = null;
    this.lotLookupError.set('');
    this.clearMessages();
  }

  prepareEdit(item: LotAtody): void {
    this.formMode = 'edit';
    this.formData = { ...item };
    if (this.formData.date_entree) {
      this.formData.date_entree = this.formData.date_entree.substring(0, 10);
    }
    const lot = this.lotsAkohoMap().get(item.Id_lot_akoho);
    this.formNumeroLot = lot ? lot.numero : null;
    this.lotLookupError.set('');
    this.clearMessages();
  }

  save(): void {
    this.clearMessages();
    this.lotLookupError.set('');

    if (!this.formNumeroLot) {
      this.lotLookupError.set('Veuillez saisir un numéro de lot de poulets.');
      return;
    }

    this.lotAkohoService.getByNumero(this.formNumeroLot).subscribe({
      next: (lot) => {
        this.formData.Id_lot_akoho = lot.Id_lot_akoho!;
        this.lotsAkohoMap.update(map => {
          const newMap = new Map(map);
          newMap.set(lot.Id_lot_akoho!, lot);
          return newMap;
        });
        this.doSave();
      },
      error: (err) => {
        this.lotLookupError.set(err.error?.message || `Aucun lot de poulets trouvé avec le numéro ${this.formNumeroLot}.`);
      }
    });
  }

  private doSave(): void {
    if (this.formMode === 'create') {
      this.lotAtodyService.create(this.formData).subscribe({
        next: () => {
          this.successMessage.set('Lot d\'œufs créé avec succès !');
          this.loadAll();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erreur lors de la création.');
          console.error('Erreur création:', err);
        }
      });
    } else {
      this.lotAtodyService.update(this.formData.Id_lot_atody!, this.formData).subscribe({
        next: () => {
          this.successMessage.set('Lot d\'œufs modifié avec succès !');
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

  deleteItem(item: LotAtody): void {
    if (!confirm(`Voulez-vous vraiment supprimer le lot d'œufs n°${item.numero} ?`)) {
      return;
    }

    this.clearMessages();

    this.lotAtodyService.delete(item.Id_lot_atody!).subscribe({
      next: () => {
        this.successMessage.set('Lot d\'œufs supprimé avec succès !');
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

  private getEmptyForm(): LotAtody {
    return {
      Id_lot_atody: null,
      numero: 0,
      date_entree: '',
      nombre: 0,
      pourcentage_atody_lamokany: 0,
      pourcentage_vavy: 50,
      Id_lot_akoho: 0
    };
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private closeModal(): void {
    const modalElement = document.getElementById('lotAtodyFormModal');
    if (modalElement) {
      const bootstrap = (window as any)['bootstrap'];
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }
}
