import { Icons } from "@/components/icons"

interface NavItem {
    title: string
    to?: string
    href?: string
    disabled?: boolean
    external?: boolean
    icon?: keyof typeof Icons
    label?: string
}

interface NavItemWithChildren extends NavItem {
    items?: NavItemWithChildren[]
}

export const mainMenu: NavItemWithChildren[] = [
    {
        title: 'Dashboard',
        to: '/',
    },
    {
        title: 'Categories',
        to: '/categories',
    },
    {
        title: 'Products',
        items: [
            {
                title: 'All Products',
                to: '/products',
            },
            {
                title: 'Add Product',
                to: '/add-product',
            },
        ]
    },
    {
        title: 'Variations',
        to: '/variations',
    },
    {
        title: 'Images',
        to: '/images',
    },
    {
        title: 'Collections',
        to: '/collections',
    },
]

export const sideMenu: NavItemWithChildren[] = []

