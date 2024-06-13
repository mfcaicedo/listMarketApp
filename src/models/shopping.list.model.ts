export interface Site {
    id: string;
    name: string;
    createAt?: string;
}

export enum ProductStatus {
    BOUGHT = 'COMPRADO',
    PENDING = 'PENDIENTE'

}

export interface Product {
    id: string;
    name: string;
    site: Site;
    status: ProductStatus 
    createAt?: string;
}

export interface ShoppingList {
    id: string;
    name: string;
    products: Product[];
    createAt?: string;
}

