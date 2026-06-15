import React from 'react'
import SidebarList from './SidebarList'

const Sidebar = () => {
    return (
        <div>
            <div className="bg-background w-80 bg-neutral-900 m-4 p-4 rounded-2xl">
                <span className="flex items-center justify-between gap-2">
                    <h2>Components</h2>
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22px" height="22px" viewBox="0 0 24 24">
                        <line x1="15" y1="4" x2="15" y2="20" fill="none" stroke="white" stroke-miterlimit="10" stroke-width="2" data-color="color-2"></line>
                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" transform="translate(24) rotate(90)" fill="none" stroke="white" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2"></rect>
                    </svg>
                </span>
                <div className="mt-10">
                    <SidebarList/>
                </div>
            </div>
        </div>
    )
}

export default Sidebar