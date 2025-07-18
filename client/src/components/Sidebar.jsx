import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'

const Sidebar = () => {

    const {getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext);

    const {logout, onlineUsers} = useContext(AuthContext)

    const [input, setInput] = useState(false)

    const navigate = useNavigate();

    const filteredUsers = input ? users.filter((user)=> user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

    useEffect(()=>{
        getUsers();
    },[onlineUsers])

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? 'max-md:hidden' : ''}`}>
      <div className="pb-5">
        <div className='flex items-center justify-between'>
            <img src={assets.logo} alt="logo" className='max-w-40' />
            <div className='relative py-2 group'>
                <img src={assets.menu_icon} alt="menu" className='max-h-5 cursor-pointer'/>
                <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
                    <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
                    <hr className='my-2 border-t border-gray-500' />
                    <p onClick={()=> logout()} className='cursor-pointer text-sm'>Logout</p>
                </div>
            </div>
        </div>

        <div className='bg-[#282142] rounded-full flex items-center gap-2 px-4 py-3 mt-5'>
            <img src={assets.search_icon} alt="Search" className='w-3' />
            <input onChange={(e)=>setInput(e.target.value)} type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='SearchUser...' />
        </div>

      </div>

    <div className='flex flex-col'>
        {filteredUsers.map((user, index) => (
    <div 
        onClick={() => {
            setSelectedUser(user);
            setUnseenMessages(prev => ({ ...prev, [user._id]: 0 }));
        }} 
        key={index} 
        className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id ? 'bg-[#282142]/50' : ''}`}
    >
        <img 
            src={user?.profilePic || assets.avatar_icon} 
            alt="" 
            className='w-[35px] aspect-square rounded-full'
        />
        <div className='flex flex-col leading-5'>
            <p>{user.fullName}</p>
            <span className={`text-xs ${onlineUsers.includes(user._id) ? 'text-green-400' : 'text-neutral-400'}`}>
                {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
            </span>
        </div>

        {/* ✅ Unread Message Badge */}
        {unseenMessages[user._id] > 0 && (
            <span className='absolute right-4 top-3 h-5 w-5 text-[10px] flex items-center justify-center bg-red-500 text-white rounded-full font-semibold'>
                {unseenMessages[user._id]}
            </span>
        )}
    </div>
))}

    </div>

    </div>
  )
}

export default Sidebar
