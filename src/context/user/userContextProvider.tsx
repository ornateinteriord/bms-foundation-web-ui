import  { useState } from 'react'
import UserContext from './userContext';
import { get } from '../../api/Api';
import { MemberDetails } from '../../store/store';

const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<MemberDetails>()
    
    const setSafeUser = (newUserOrFn: any) => {
        setUser((prevUser) => {
            const resolved = typeof newUserOrFn === 'function' ? newUserOrFn(prevUser) : newUserOrFn;
            if (!prevUser) return resolved;
            if (!resolved) return resolved;
            try {
                if (JSON.stringify(prevUser) === JSON.stringify(resolved)) {
                    return prevUser;
                }
            } catch {
                // fallback
            }
            return resolved;
        });
    };

    const getUser = async (userId: string) => {
       return await get(`/user/member/${userId}`)
    };
  

    return (
        <UserContext.Provider value={{ user, getUser, setUser: setSafeUser }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider