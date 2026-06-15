import React from 'react'

const componentList=[
    {
        id:0,
        name:"Folder component",
    }
,{
    id:1,
    name:"Button component",
}
]

const SidebarList = () => {
  return (
    <div>
        {componentList.map((component)=>(
            <div key={component.id} className="flex items-center gap-2 p-2 hover:bg-neutral-800 rounded-lg cursor-pointer">
                <span>{component.name}</span>
            </div>
        ))}
    </div>
  )
}

export default SidebarList