import { Head, useForm, router } from '@inertiajs/react';
import { GoogleMap, useJsApiLoader, MarkerF, Autocomplete } from '@react-google-maps/api';
import { Camera, Plus, Minus, Calendar, MapPin, Trash2, ArrowUp, Save } from 'lucide-react';
import { useState, useRef } from 'react';
import Footer from '@/layouts/Footer';
import NavBar from '@/layouts/NavBar';

const GOOGLE_MAPS_LIBRARIES: any = ['places'];

interface Category {
  id: number;
  name: string;
}

interface CreateProps {
  categories: Category[];
}

export default function Create({ categories }: CreateProps) {
  // 1. Inertia Form State
  const { data, setData, processing, errors } = useForm({
    title: '',
    category_id: '',
    description: '',
    type: 'offline' as 'online' | 'offline',
    location_name: '',
    address: '',
    latitude: -7.79558, // default Yogyakarta
    longitude: 110.36949, // default Yogyakarta
    platform_name: '',
    link: '',
    start_datetime: '',
    end_datetime: '',
    capacity: 50,
    poster: null as File | null,
  });

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const autocompleteRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const addressName = place.formatted_address || '';
        const nameOfPlace = place.name || addressName;

        setData(prev => ({
          ...prev,
          location_name: nameOfPlace,
          address: addressName,
          latitude: lat,
          longitude: lng,
        }));

        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(16);
        }
      }
    }
  };

  const handleMarkerDragEnd = (e: any) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      setData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));

      if (typeof window !== 'undefined' && (window as any).google) {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results?.[0]) {
            const formattedAddress = results[0].formatted_address;
            setData(prev => ({
              ...prev,
              location_name: formattedAddress,
              address: formattedAddress,
              latitude: lat,
              longitude: lng,
            }));
          }
        });
      }
    }
  };

  // 2. Mockup-only fields (local state)
  const [organizer, setOrganizer] = useState('');
  const [tags, setTags] = useState('');
  const [contacts, setContacts] = useState([{ name: '', info: '' }]);

  // 3. Poster Upload & Preview State
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setData('poster', file);
      const url = URL.createObjectURL(file);
      setPosterPreview(url);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 4. Capacity Stepper Actions
  const incrementCapacity = () => {
    setData('capacity', Number(data.capacity) + 1);
  };

  const decrementCapacity = () => {
    if (Number(data.capacity) > 1) {
      setData('capacity', Number(data.capacity) - 1);
    }
  };

  // 5. Contacts List Actions
  const addContact = () => {
    setContacts([...contacts, { name: '', info: '' }]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const updateContact = (index: number, field: 'name' | 'info', value: string) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  // 6. Submit Event Handler
  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare description by serializing the mockup-only fields at the end
    const contactLines = contacts
      .filter(c => c.name || c.info)
      .map(c => `- ${c.name}: ${c.info}`)
      .join('\n');
      
    const finalDescription = [
      data.description,
      '---',
      organizer ? `**Penyelenggara:** ${organizer}` : '',
      tags ? `**Tags:** ${tags}` : '',
      contactLines ? `**Kontak:**\n${contactLines}` : ''
    ].filter(Boolean).join('\n\n');

    // Submit using multipart POST (required for file uploads)
    // If it's offline, make sure address matches location_name
    const submissionData = {
      ...data,
      description: finalDescription,
      address: data.type === 'offline' ? (data.address || data.location_name) : '',
      platform_name: data.type === 'online' ? (data.link.includes('zoom') ? 'Zoom' : 'Google Meet') : '',
    };

    // Use router post to send the form
    const formData = new FormData();
    Object.entries(submissionData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'poster') {
          formData.append(key, value as File);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Inertia post action
    router.post('/dashboard/events', formData);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <div className="flex-grow">
        <NavBar />
        <Head title="Buat Event Baru" />

        <form onSubmit={(e) => submit(e)} className="max-w-[1080px] mx-auto px-4 md:px-8 py-10 pt-28 flex flex-col gap-10 pb-16">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-4 text-small font-bold text-gray-400">
          <a href="/dashboard/events" className="hover:text-primary-500">Kelola Event</a>
          <span>/</span>
          <span className="text-primary-500">Buat Event</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Poster, Tags, Capacity, Dates */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            {/* Poster Event Upload Container */}
            <div className="flex flex-col gap-3">
              <h4 className="text-neutral-900 font-extrabold text-lg font-brand">
                Poster Event
              </h4>
              
              <div 
                onClick={triggerFileInput}
                className="w-full aspect-16/9 border-2 border-dashed border-neutral-300 rounded-3xl flex flex-col items-center justify-center p-6 gap-3 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/10 transition-all duration-300 relative overflow-hidden bg-neutral-50"
              >
                {posterPreview ? (
                  <img src={posterPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Camera size={20} />
                      <Plus size={16} />
                    </div>
                    <span className="text-gray-400 text-small font-bold font-brand">
                      Unggah Poster (16:9)
                    </span>
                  </>
                )}
              </div>
              <span className="text-gray-400 text-micro text-center font-semibold">
                ukuran maksimal 5mb, png, jpg, svg
              </span>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePosterChange}
                accept="image/*"
                className="hidden" 
              />
              
              <button 
                type="button" 
                onClick={triggerFileInput}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full shadow-md cursor-pointer transition-colors"
              >
                <span>Ubah Poster</span>
                <ArrowUp size={16} />
              </button>
              {errors.poster && <span className="text-red-500 text-micro font-bold">{errors.poster}</span>}
            </div>

            {/* Tags Pencarian */}
            <div className="flex flex-col gap-2.5 p-5 bg-primary-50/30 border border-primary-100/30 rounded-3xl">
              <div className="flex items-center justify-between">
                <span className="text-neutral-800 font-extrabold text-small font-brand">Tags Pencarian</span>
                <span className="text-secondary-500 font-bold text-base">#</span>
              </div>
              <input 
                type="text" 
                placeholder="tambahkan tag, #"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-base font-medium placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Kuota Peserta */}
            <div className="flex flex-col gap-2.5 p-5 bg-primary-50/30 border border-primary-100/30 rounded-3xl">
              <span className="text-neutral-800 font-extrabold text-small font-brand">Kuota Peserta</span>
              <div className="flex items-center justify-between bg-white px-4 py-2 border border-gray-200 rounded-lg">
                <button 
                  type="button" 
                  onClick={decrementCapacity}
                  className="p-1.5 text-secondary-500 hover:bg-secondary-100 rounded-full cursor-pointer transition-colors"
                >
                  <Minus size={18} />
                </button>
                <input 
                  type="number" 
                  value={data.capacity}
                  onChange={(e) => setData('capacity', Number(e.target.value))}
                  className="text-center font-bold text-lg text-neutral-800 border-0 outline-none w-16 focus:ring-0"
                />
                <button 
                  type="button" 
                  onClick={incrementCapacity}
                  className="p-1.5 text-primary-500 hover:bg-primary-50 rounded-full cursor-pointer transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              {errors.capacity && <span className="text-red-500 text-micro font-bold">{errors.capacity}</span>}
            </div>

            {/* Waktu dan Tanggal */}
            <div className="flex flex-col gap-4 p-5 bg-primary-50/30 border border-primary-100/30 rounded-3xl relative">
              <div className="flex items-center justify-between">
                <span className="text-neutral-800 font-extrabold text-small font-brand">Waktu dan Tanggal</span>
                <Calendar size={18} className="text-secondary-400" />
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-micro font-bold text-gray-500">Mulai</label>
                  <input 
                    type="datetime-local" 
                    value={data.start_datetime}
                    onChange={(e) => setData('start_datetime', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-base font-semibold text-neutral-800 focus:outline-none focus:border-primary-500"
                  />
                  {errors.start_datetime && <span className="text-red-500 text-micro font-bold">{errors.start_datetime}</span>}
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-micro font-bold text-gray-500">Selesai</label>
                  <input 
                    type="datetime-local" 
                    value={data.end_datetime}
                    onChange={(e) => setData('end_datetime', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-base font-semibold text-neutral-800 focus:outline-none focus:border-primary-500"
                  />
                  {errors.end_datetime && <span className="text-red-500 text-micro font-bold">{errors.end_datetime}</span>}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Form details, Contacts, Location & Description */}
          <div className="lg:col-span-7 flex flex-col gap-6 w-full">
            
            {/* Nama Event */}
            <div className="flex flex-col gap-2">
              <h4 className="text-neutral-900 font-extrabold text-lg font-brand">Nama Event</h4>
              <input 
                type="text" 
                placeholder="Nama Event"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                required
                className="w-full px-5 py-3.5 bg-secondary-100 rounded-xl border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-brand font-medium placeholder-gray-400 text-base transition-all duration-200"
              />
              {errors.title && <span className="text-red-500 text-micro font-bold">{errors.title}</span>}
            </div>

            {/* Kategori */}
            <div className="flex flex-col gap-2">
              <h4 className="text-neutral-900 font-extrabold text-lg font-brand">Kategori</h4>
              <div className="relative">
                <select 
                  value={data.category_id}
                  onChange={(e) => setData('category_id', e.target.value)}
                  className="w-full px-5 py-3.5 bg-secondary-100 rounded-xl border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-brand font-semibold text-neutral-600 appearance-none transition-all duration-200"
                >
                  <option value="">Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-500 font-bold">
                  ▼
                </div>
              </div>
              {errors.category_id && <span className="text-red-500 text-micro font-bold">{errors.category_id}</span>}
            </div>

            {/* Penyelenggara */}
            <div className="flex flex-col gap-2">
              <h4 className="text-neutral-900 font-extrabold text-lg font-brand">Penyelenggara</h4>
              <input 
                type="text" 
                placeholder="Nama penyelenggara/EO"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full px-5 py-3.5 bg-secondary-100 rounded-xl border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-brand font-medium placeholder-gray-400 text-base transition-all duration-200"
              />
            </div>

            {/* Kontak */}
            <div className="flex flex-col gap-3 p-5 bg-secondary-100 rounded-2xl">
              <h4 className="text-neutral-800 font-extrabold text-base font-brand">Kontak</h4>
              
              <div className="flex flex-col gap-3">
                {contacts.map((contact, index) => (
                  <div key={index} className="flex gap-2.5 items-center">
                    <input 
                      type="text" 
                      placeholder="Nama"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      className="flex-1 min-w-0 px-4 py-3 bg-white border border-gray-200 rounded-lg text-base font-medium"
                    />
                    <input 
                      type="text" 
                      placeholder="No. Telepon / E-mail"
                      value={contact.info}
                      onChange={(e) => updateContact(index, 'info', e.target.value)}
                      className="flex-2 min-w-0 px-4 py-3 bg-white border border-gray-200 rounded-lg text-base font-medium"
                    />
                    {contacts.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeContact(index)}
                        className="p-2 text-red-500 bg-white border border-gray-150 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                type="button" 
                onClick={addContact}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-base rounded-full shadow-md cursor-pointer transition-colors mt-2"
              >
                <Plus size={16} />
                <span>tambah kontak/email</span>
              </button>
            </div>

            {/* Detail Event */}
            <div className="flex flex-col gap-4">
              <h4 className="text-neutral-900 font-extrabold text-lg font-brand">Detail Event</h4>
              
              <div className="flex flex-col gap-4 p-5 bg-secondary-100 rounded-2xl">
                
                {/* Lokasi (Online/Offline) Toggle */}
                <div className="flex flex-col gap-2">
                  <label className="text-neutral-700 font-extrabold text-base font-brand">Lokasi</label>
                  
                  <div className="flex gap-4 items-center">
                    {/* Toggle Switch */}
                    <div className="flex bg-neutral-200 p-0.5 rounded-full w-fit shrink-0 relative">
                      {/* Sliding background bubble */}
                      <div 
                        className="absolute top-0.5 bottom-0.5 left-0.5 bg-primary-500 rounded-full transition-transform duration-300 ease-out"
                        style={{
                          width: 'calc(50% - 0.25rem)',
                          transform: data.type === 'offline' ? 'translateX(100%)' : 'translateX(0%)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setData('type', 'online')}
                        className={`relative z-10 px-4 py-1.5 font-bold text-micro rounded-full cursor-pointer transition-colors duration-300 ${data.type === 'online' ? 'text-white' : 'text-neutral-600'}`}
                      >
                        Online
                      </button>
                      <button
                        type="button"
                        onClick={() => setData('type', 'offline')}
                        className={`relative z-10 px-4 py-1.5 font-bold text-micro rounded-full cursor-pointer transition-colors duration-300 ${data.type === 'offline' ? 'text-white' : 'text-neutral-600'}`}
                      >
                        Offline
                      </button>
                    </div>
                    
                    {/* Location Input fields based on toggle */}
                    {data.type === 'offline' ? (
                      isLoaded ? (
                        <div className="flex-grow w-full">
                          <Autocomplete
                            onLoad={(autocomplete) => {
 autocompleteRef.current = autocomplete; 
}}
                            onPlaceChanged={handlePlaceChanged}
                          >
                            <input 
                              type="text" 
                              placeholder="Cari Alamat atau Nama Tempat..."
                              value={data.location_name}
                              onChange={(e) => setData('location_name', e.target.value)}
                              required
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-full text-base font-medium focus:outline-none focus:border-primary-500"
                            />
                          </Autocomplete>
                        </div>
                      ) : loadError ? (
                        <div className="flex-grow text-red-500 text-micro font-bold py-2 px-4 bg-red-50 rounded-full border border-red-200">
                          Gagal memuat autocomplete: {loadError.message}
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="Memuat Pencarian Alamat..."
                          disabled
                          className="flex-grow px-4 py-2 bg-neutral-100 border border-gray-200 rounded-full text-base font-medium"
                        />
                      )
                    ) : (
                      <input 
                        type="text" 
                        placeholder="Link Zoom/Gmeet/apapun"
                        value={data.link}
                        onChange={(e) => setData('link', e.target.value)}
                        required
                        className="flex-grow px-4 py-2 bg-white border border-gray-200 rounded-full text-base font-medium focus:outline-none focus:border-primary-500"
                      />
                    )}
                  </div>
                  {errors.location_name && <span className="text-red-500 text-micro font-bold">{errors.location_name}</span>}
                  {errors.link && <span className="text-red-500 text-micro font-bold">{errors.link}</span>}
                </div>

                {/* Google Map Box (Only for Offline) */}
                {data.type === 'offline' && (
                  <div className="w-full flex flex-col gap-2">
                    <div className="w-full h-[220px] bg-neutral-100 border border-gray-200 rounded-2xl overflow-hidden relative shadow-sm">
                      {isLoaded ? (
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '220px' }}
                          center={{ lat: data.latitude, lng: data.longitude }}
                          zoom={15}
                          onLoad={(map) => {
 mapRef.current = map; 
}}
                          options={{
                            disableDefaultUI: true,
                            zoomControl: true,
                            streetViewControl: false,
                          }}
                        >
                          <MarkerF
                            position={{ lat: data.latitude, lng: data.longitude }}
                            draggable={true}
                            onDragEnd={handleMarkerDragEnd}
                          />
                        </GoogleMap>
                      ) : loadError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-red-500 gap-1.5 p-4 text-center">
                          <MapPin size={24} className="text-red-500" />
                          <span className="font-bold text-small font-brand">Gagal Memuat Google Maps</span>
                          <span className="text-micro font-semibold text-gray-400">{loadError.message}</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1.5">
                          <MapPin size={24} className="text-primary-500 animate-bounce" />
                          <span className="font-bold text-small font-brand text-gray-500">Memuat Google Maps...</span>
                        </div>
                      )}
                    </div>
                    {data.address && (
                      <div className="text-micro font-semibold text-gray-500 mt-1 px-1">
                        <span className="font-extrabold text-neutral-800">Alamat Lengkap:</span> {data.address}
                      </div>
                    )}
                  </div>
                )}

                {/* Deskripsi */}
                <div className="flex flex-col gap-2">
                  <label className="text-neutral-700 font-extrabold text-base font-brand">Deskripsi</label>
                  <textarea 
                    placeholder="Tulis deskripsi event secara detail di sini..."
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    required
                    rows={6}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-base font-brand font-medium placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors leading-relaxed"
                  />
                  {errors.description && <span className="text-red-500 text-micro font-bold">{errors.description}</span>}
                </div>

              </div>
            </div>

            {/* Bottom Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
              <button 
                type="button" 
                onClick={(e) => submit(e)}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 border-2 border-secondary-400 bg-white hover:bg-secondary-50 text-secondary-600 font-bold text-lg rounded-full cursor-pointer transition-colors shadow-sm"
              >
                <span>Simpan Draf</span>
                <Save size={18} className="text-secondary-500" />
              </button>
              
              <button 
                type="submit" 
                disabled={processing}
                className="flex-2 flex items-center justify-center gap-2.5 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-full cursor-pointer transition-colors shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <span>Terbitan Event</span>
                <Plus size={18} />
              </button>
            </div>

          </div>

        </div>

      </form>

      </div>
      <Footer />
    </div>
  );
}
