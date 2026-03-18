import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NaissanceOeufService } from '../../services/naissance-oeuf.service';
import { LotAtodyService } from '../../services/lot-atody.service';
import { LotAkohoService } from '../../services/lot-akoho.service';
import { NaissanceOeuf } from '../../models/naissance-oeuf.model';
import { LotAtody } from '../../models/lot-atody.model';
import { LotAkoho } from '../../models/lot-akoho.model';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-naissance-oeuf',
  imports: [CommonModule, FormsModule],
  templateUrl: './naissance-oeuf.html',
  styleUrl: './naissance-oeuf.css'
})
export class NaissanceOeufComponent implements OnInit {

  private naissanceOeufService = inject(NaissanceOeufService);
  private lotAtodyService = inject(LotAtodyService);
  private lotAkohoService = inject(LotAkohoService);

  items = signal<NaissanceOeuf[]>([]);
  lotsAtody = signal<LotAtody[]>([]);
  lotsAtodyMap = signal(new Map<number, LotAtody>());
  lotsAkohoMap = signal(new Map<number, LotAkoho>());

  formData: NaissanceOeuf = this.getEmptyForm();
  formNumeroLotAtody: number | null = null;
  lotLookupError = signal('');
  formMode: 'create' | 'edit' = 'create';
  loading = signal(false);
  saving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit(): void {
    this.loadAll();
    this.loadLotsAtody();
  }

  loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.naissanceOeufService.getAll().subscribe({
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
    const uniqueAtodyIds = [...new Set(this.items().map(i => i.Id_lot_atody))];
    uniqueAtodyIds.forEach(id => {
      if (!this.lotsAtodyMap().has(id)) {
        this.lotAtodyService.getById(id).subscribe({
          next: (lot) => {
            this.lotsAtodyMap.update(map => {
              const newMap = new Map(map);
              newMap.set(id, lot);
              return newMap;
            });
            this.loadLotAkohoInfo(lot.Id_lot_akoho);
          },
          error: () => {}
        });
      } else {
        const lot = this.lotsAtodyMap().get(id);
        if (lot) this.loadLotAkohoInfo(lot.Id_lot_akoho);
      }
    });
  }

  loadLotAkohoInfo(idLotAkoho: number): void {
    if (!this.lotsAkohoMap().has(idLotAkoho)) {
      this.lotAkohoService.getById(idLotAkoho).subscribe({
        next: (lot) => {
          this.lotsAkohoMap.update(map => {
            const newMap = new Map(map);
            newMap.set(idLotAkoho, lot);
            return newMap;
          });
        },
        error: () => {}
      });
    }
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

  prepareEdit(item: NaissanceOeuf): void {
    this.formMode = 'edit';
    this.formData = { ...item };
    if (this.formData.date_naissance) {
      this.formData.date_naissance = this.formData.date_naissance.substring(0, 10);
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

    // Rechercher le lot atody par son numéro
    const lotAtody = this.lotsAtody().find(l => l.numero === this.formNumeroLotAtody);
    if (!lotAtody || !lotAtody.Id_lot_atody) {
      this.lotLookupError.set(`Aucun lot d'œufs trouvé avec le numéro ${this.formNumeroLotAtody}.`);
      return;
    }

    this.formData.Id_lot_atody = lotAtody.Id_lot_atody;

    if (this.formMode === 'edit') {
      this.doUpdate();
      return;
    }

    // Mode création : on crée la naissance + un nouveau lot akoho
    this.saving.set(true);

    // D'abord récupérer le lot_akoho parent pour avoir la race
    this.lotAkohoService.getById(lotAtody.Id_lot_akoho).subscribe({
      next: (lotAkohoParent) => {
        // 1. Créer la naissance_oeuf
        this.naissanceOeufService.create(this.formData).subscribe({
          next: () => {
            this.generateNewLotNumero().subscribe({
              next: (newNumero) => {
                // 2. Créer le nouveau lot_akoho (poussins nés)
                const newLotAkoho: LotAkoho = {
                  Id_lot_akoho: null,
                  numero: newNumero,
                  date_entree: this.formData.date_naissance,
                  nombre: this.formData.nombre_poussin || 0,
                  age: 0,
                  nombre_akoho_vavy: 0,
                  prix_achat: 0,
                  Id_race: lotAkohoParent.Id_race
                };

                this.lotAkohoService.create(newLotAkoho).subscribe({
                  next: (lotCreated) => {
                    this.saving.set(false);
                    this.successMessage.set(
                      `Naissance enregistrée ! Nouveau lot de poulets n°${lotCreated.numero} créé (${newLotAkoho.nombre} poussins, prix achat : 0 Ar).`
                    );
                    this.loadAll();
                    this.closeModal();
                  },
                  error: (err) => {
                    this.saving.set(false);
                    this.successMessage.set('Naissance enregistrée, mais erreur lors de la création du lot de poulets.');
                    this.errorMessage.set(err.error?.message || 'Erreur lors de la création du lot de poulets.');
                    this.loadAll();
                    this.closeModal();
                    console.error('Erreur création lot akoho:', err);
                  }
                });
              },
              error: (err) => {
                this.saving.set(false);
                this.errorMessage.set(err.error?.message || 'Erreur lors de la génération du numéro de lot.');
                console.error('Erreur génération numéro lot akoho:', err);
              }
            });
          },
          error: (err) => {
            this.saving.set(false);
            this.errorMessage.set(err.error?.message || 'Erreur lors de l\'enregistrement de la naissance.');
            console.error('Erreur création naissance:', err);
          }
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(err.error?.message || 'Erreur lors de la récupération du lot de poulets parent.');
        console.error('Erreur get lot akoho parent:', err);
      }
    });
  }

  private doUpdate(): void {
    this.naissanceOeufService.update(this.formData.Id_naissance_oeuf!, this.formData).subscribe({
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

  deleteItem(item: NaissanceOeuf): void {
    if (!confirm(`Voulez-vous vraiment supprimer l'enregistrement de naissance #${item.Id_naissance_oeuf} ?`)) {
      return;
    }

    this.clearMessages();

    this.naissanceOeufService.delete(item.Id_naissance_oeuf!).subscribe({
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

  private generateNewLotNumero(): Observable<number> {
    return this.lotAkohoService.getAll().pipe(
      map(lots => {
        const maxNumero = lots.reduce((max, lot) => lot.numero > max ? lot.numero : max, 0);
        return maxNumero + 1;
      })
    );
  }

  private getEmptyForm(): NaissanceOeuf {
    return {
      Id_naissance_oeuf: null,
      nombre_poussin: 0,
      date_naissance: '',
      Id_lot_atody: 0
    };
  }

  clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private closeModal(): void {
    const modalElement = document.getElementById('naissanceOeufFormModal');
    if (modalElement) {
      const bootstrap = (window as any)['bootstrap'];
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }
}
