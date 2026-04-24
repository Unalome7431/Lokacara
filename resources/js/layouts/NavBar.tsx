import Button from '@/components/ui/Button';

import defaultAvatar from '@/../../public/avatars/default.png';
import faviconUrl from '@/../../public/favicon.svg';
import SearchIcon from '@mui/icons-material/Search';
import LocationIcon from '@mui/icons-material/FmdGoodOutlined';

export default function NavBar({isAuthenticated = true}:{isAuthenticated?:boolean}) {

  return(
    <nav className="sticky flex p-10 justify-between items-center w-screen drop-shadow-xl h-22.5 bg-white">
      {/*Logo and Home Button*/}
      <a href="/" className='flex items-center gap-2'>
        <img src={faviconUrl} alt="Lokacara" className='w-6 h-7.5'/>
        <span className='font-important font-bold lg:text-h6-web text-primary-500'>lokacara</span>
      </a>

      {/*Search Bar and Location*/}
      <div className='flex w-fit h-fit px-5 py-2.5 rounded-[10rem] border border-gray-600'>
        {/*Search Bar*/}
        <div className='flex gap-2'>
          <SearchIcon className='text-gray-600' />
          <form action="search" method='GET' role='search'>
            <input 
              type='search' 
              id='searchBar'
              name='searchBar'
              placeholder='Cari'
              className='placeholder-gray-300 outline-0'
            />
          </form>
        </div>

        {/*Location*/}
        <div className='flex gap-2'>
          <LocationIcon className='text-gray-600' />
          <form action="search" method='GET' role='search'>
            <input 
              type='search' 
              id='searchBar'
              name='searchBar'
              placeholder='Lokasi'
              className='placeholder-gray-300 outline-0'
            />
          </form>
        </div>
      </div>

      {/*Create Event Button and User Profile or Login Button*/}
      <div className='flex gap-5'>
        {isAuthenticated ?
          <>
            {/*Create Event*/}
            <Button href='/dashboard' className='text-small'>
              Dashboard
            </Button>

            {/*User Profile*/}
            <div>
              <img src={defaultAvatar} alt="User"  className='size-12 rounded-[10rem]'/>
            </div>
          </>
          :
          /*Login Button*/
          <Button href='/login'/>
        }
      </div>
    </nav>
  )
}