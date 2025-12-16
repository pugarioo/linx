import React from 'react'
import { NavigationMenu, NavigationMenuLink } from '@/components/ui/navigation-menu';

function Navbar() {
    return (
        <NavigationMenu className='h-16 w-full px-15 fixed text-white flex justify-start' >
            <NavigationMenuLink className='text-xl'>
                LINX
            </NavigationMenuLink>

        </NavigationMenu>
    )
}

export default Navbar