export enum VariationType {
  STANDARD = 'STANDARD',
  EGG_SUBSTITUTE = 'EGG_SUBSTITUTE'
}

export interface MenuVariationUpdateData {
  proteinItemId?: string;
  isDefault?: boolean;
}

export class MenuVariation {
  constructor(
    public readonly id: string,
    public readonly menuId: string,
    public readonly variationType: VariationType,
    public proteinItemId: string,
    public isDefault: boolean
  ) {}

  public update(data: MenuVariationUpdateData): void {
    if (data.proteinItemId !== undefined) this.proteinItemId = data.proteinItemId;
    if (data.isDefault !== undefined) this.isDefault = data.isDefault;
  }

  public isStandard(): boolean {
    return this.variationType === VariationType.STANDARD;
  }

  public isEggSubstitute(): boolean {
    return this.variationType === VariationType.EGG_SUBSTITUTE;
  }
}
