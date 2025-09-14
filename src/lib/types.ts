// auth types
export type userData = {
  bearer_token: string;
  refresh_token: string;
  institute_code: string;
};

// basic constructors
export type Kategoria = {
  Uid: string;
  Nev: string;
  Leiras: string;
};

export type Tantargy = {
  Uid: string;
  Nev: string;
  Kategoria: Kategoria;
  SortIndex: number;
};

export type Mod = {
  Uid: string;
  Nev: string;
  Leiras: string;
};

export type OsztalyCsoport = {
  Uid: string;
};

// grade types
export type ErtekFajta = {
  Leiras: string;
  Nev: string;
  Uid: string;
};

export type Tipus = {
  Leiras: string;
  Nev: string;
  Uid: string;
};

export type Ertekeles = {
  KeszitesDatuma: string;
  Jelleg: string;
  ErtekFajta: ErtekFajta;
  OsztalyCsoport: OsztalyCsoport;
  Mod: Mod;
  SzamErtek: number;
  RogzitesDatuma: string;
  LattamozasDatuma: string;
  SzovegesErtekelesRovidNev: string;
  SortIndex: number;
  Tantargy: Tantargy;
  ErtekeloTanarNeve: string;
  Tema: string;
  Tipus: Tipus;
  Uid: string;
  SzovegesErtek: string;
  SulySzazalekErteke: string;
};

// student types
export type Gondviselo = {
  Uid: string;
  IdpUniqueId: string;
  Nev: string;
  EmailCim: string;
  Telefonszam: string;
  IsTorvenyesKepviselo: boolean;
};

export type Bankszamla = {
  BankszamlaSzam: string;
  BankszamlaTulajdonosTipusId: number;
  BankszamlaTulajdonosNeve: string;
  IsReadOnly: boolean;
};

export type Rendszermodul = {
  IsAktiv: boolean;
  Tipus: string;
  Url: string;
};

export type TestreszabasBeallitasok = {
  IsDiakRogzithetHaziFeladatot: boolean;
  IsTanorakTemajaMegtekinthetoEllenorzoben: boolean;
  IsOsztalyAtlagMegjeleniteseEllenorzoben: boolean;
  ErtekelesekMegjelenitesenekKesleltetesenekMerteke: number;
  KovetkezoTelepitesDatuma: string;
};

export type Intezmeny = {
  Uid: string;
  RovidNev: string;
  Rendszermodulok: Rendszermodul[];
  TestreszabasBeallitasok: TestreszabasBeallitasok;
};

export type Diak = {
  Uid: string;
  IdpUniqueId: string;
  TanevUid: string;
  IntezmenyNev: string;
  IntezmenyAzonosito: string;
  Nev: string;
  SzuletesiNev: string;
  SzuletesiHely: string;
  AnyjaNeve: string;
  Telefonszam: string;
  EmailCim: string;
  Cimek: string[];
  SzuletesiDatum: string;
  SzuletesiEv: number;
  SzuletesiHonap: number;
  SzuletesiNap: number;
  Gondviselok: Gondviselo[];
  Bankszamla: Bankszamla;
  Intezmeny: Intezmeny;
};

// test types
export type Bejelentes = {
  Uid: string;
  Datum: string;
  BejelentesDatuma: string;
  RogzitoTanarNeve: string;
  OrarendiOraOraszama: number;
  Tantargy: Tantargy;
  TantargyNeve: string;
  Temaja: string;
  Modja: Mod;
  OsztalyCsoport: OsztalyCsoport;
};

// homework types
export type Csatolmany = {
    Nev: string;
    Tipus: string;
    Uid: string;
}

export type HaziFeladat = {
  Uid: string;
  Tantargy: Tantargy;
  TantargyNeve: string;
  RogzitoTanarNeve: string;
  Szoveg: string;
  FeladasDatuma: string;
  HataridoDatuma: string;
  RogzitesIdopontja: string;
  IsTanarRogzitette: boolean;
  IsTanuloHaziFeladatEnabled: boolean;
  IsMegoldva: boolean;
  IsBeadhato: boolean;
  OsztalyCsoport: OsztalyCsoport;
  IsCsatolasEngedelyezes: boolean;
  Csatolmanyok?: Csatolmany[];
};
