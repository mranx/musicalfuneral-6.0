"use client";
import React, { useState, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown } from 'lucide-react';
import AudioPlayer from "@/_mycomponents/common/AudioPlayer";
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface VocalItem {
  id: string;
  name: string;
  checked: boolean;
  duration: string;
  audioFile: string;
}

// Add the PreferenceFormProps interface
interface PreferenceFormProps {
  existingData?: any;
  orderId?: string;
  mode?: 'create' | 'edit';
}

export default function CatholicPreferenceForm({
  existingData,
  orderId: propOrderId,
  mode = 'create'
}: PreferenceFormProps) {
  const router = useRouter();
  
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<{[key: string]: boolean}>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(propOrderId || null);
  
  const [sections, setSections] = useState({
    startOfRosary: true,
    penitentialRite: true,
    responsorialPsalm: true,
    offertoryProcession: true,
    holyHoly: true,
    memorialAcclamation: true,
    greatAmen: true,
    lambOfGod: true,
    fillerMusic: true,
    finalCommendation: true,
    recessional: true,
  });

  // Required field state tracking
  const [selectionState, setSelectionState] = useState({
    penitentialRite: "",
    responsorialPsalm: "",
    lambOfGod: "",
    fillerMusic: "",
    finalCommendation: "",
  });

  const [vocalSections, setVocalSections] = useState({
    startOfRosary: [
      { id: '1', name: 'Vocal Name 1', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '2', name: 'Vocal Name 2', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '3', name: 'Vocal Name 3', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '4', name: 'Vocal Name 4', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
    ],
    offertoryProcession: [
      { id: '1', name: 'Vocal Name 1', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '2', name: 'Vocal Name 2', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '3', name: 'Vocal Name 3', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
    ],
    holyHoly: [
      { id: '1', name: 'Vocal Name 1', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '2', name: 'Vocal Name 2', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '3', name: 'Vocal Name 3', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
    ],
    memorialAcclamation: [
      { id: '1', name: 'Vocal Name 1', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '2', name: 'Vocal Name 2', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '3', name: 'Vocal Name 3', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
    ],
    greatAmen: [
      { id: '1', name: 'Vocal Name 1', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '2', name: 'Vocal Name 2', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '3', name: 'Vocal Name 3', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
    ],
    recessional: [
      { id: '1', name: 'Vocal Name 1', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '2', name: 'Vocal Name 2', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
      { id: '3', name: 'Vocal Name 3', checked: false, duration: '0:30 sec', audioFile: 'audio.mp3' },
    ],
  });

  const [additionalOptions, setAdditionalOptions] = useState({
    viewingMusic: false,
    filterMusicPreMass: false,
    placingOfSymbols: false,
  });

  // Helper function to apply existing data
  const handleExistingData = (savedData: any) => {
    // Restore vocal selections
    if (savedData.vocalSelections) {
      Object.entries(savedData.vocalSelections).forEach(([section, selection]: [string, any]) => {
        if (selection && vocalSections[section as keyof typeof vocalSections]) {
          updateVocalSection(section, selection.id, true);
        }
      });
    }
    
    // Restore dropdown selections
    if (savedData.selectionState) {
      setSelectionState(savedData.selectionState);
    }
    
    // Restore additional options
    if (savedData.additionalOptions) {
      setAdditionalOptions(savedData.additionalOptions);
    }
  };

  // Load saved data using cookies
  useEffect(() => {
    // If we already have existing data from props, use it
    if (existingData && mode === 'edit') {
      // Apply existing data
      handleExistingData(existingData);
      setIsLoading(false);
      return;
    }
    
    const loadSavedData = async () => {
      try {
        setIsLoading(true);
        // Use the 'current' endpoint which will use the cookie
        const response = await axios.get('/api/forms/current');
        
        if (response.data.success) {
          // Save the orderId for later use
          if (response.data.orderId) {
            setOrderId(response.data.orderId);
          }
          
          // Check if Catholic preference data exists
          const savedData = response.data.formData?.catholicPreference;
          
          if (savedData) {
            handleExistingData(savedData);
          }
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
        // Non-fatal error, continue with empty form
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedData();
  }, [existingData, mode]);

  const updateVocalSection = (section: string, id: string, checked: boolean) => {
    setVocalSections((prev: any) => ({
      ...prev,
      [section]: prev[section].map((item: VocalItem) =>
        item.id === id 
          ? { ...item, checked } 
          : { ...item, checked: false } 
      )
    }));
    
    // Clear error for this section if a selection is made
    if (checked) {
      setFormErrors(prev => ({...prev, [section]: false}));
    }
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev: any) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Function to handle when a new audio starts playing
  const handleAudioPlay = (audioElement: HTMLAudioElement, itemId: string) => {
    // Stop the currently playing audio if any
    if (currentAudioRef.current && currentAudioRef.current !== audioElement) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
    
    // Set the new audio as current
    currentAudioRef.current = audioElement;
    setCurrentPlaying(itemId);
  };

  const handleSelectionChange = (value: string, field: string) => {
    setSelectionState(prev => ({...prev, [field]: value}));
    setFormErrors(prev => ({...prev, [field]: false}));
  };

  const validateForm = () => {
    const errors: {[key: string]: boolean} = {};
    let isValid = true;

    // Check dropdowns
    Object.entries(selectionState).forEach(([key, value]) => {
      if (!value) {
        errors[key] = true;
        isValid = false;
      }
    });

    // Check all vocal sections to ensure at least one item is selected in each
    const vocalSectionNames = ['startOfRosary', 'offertoryProcession', 'holyHoly', 
                              'memorialAcclamation', 'greatAmen', 'recessional'];
    
    vocalSectionNames.forEach(section => {
      const hasSelection = vocalSections[section as keyof typeof vocalSections]
        .some((item: VocalItem) => item.checked);
      
      if (!hasSelection) {
        errors[section] = true;
        isValid = false;
      }
    });
    
    setFormErrors(errors);
    return isValid;
  };

  // Function to collect all form data
  const collectFormData = () => {
    // Get selections from all vocal sections
    const vocalSelections = Object.entries(vocalSections).reduce((acc, [section, items]) => {
      const selectedItem = items.find(item => item.checked);
      return {
        ...acc,
        [section]: selectedItem ? { id: selectedItem.id, name: selectedItem.name } : null
      };
    }, {});
    
    return {
      vocalSelections,
      selectionState,
      additionalOptions
    };
  };

  const handleNextClick = async () => {
    setFormSubmitted(true);
    
    if (validateForm()) {
      try {
        setIsSaving(true);
        
        // Collect all form data
        const formData = collectFormData();
        
        // Save the form data with orderId if available
        await axios.put('/api/forms/update', {
          formName: 'catholicPreference',
          formData,
          orderId: orderId // Include orderId to ensure the correct order is updated
        });
        
        // Navigate to the next page
        router.push('/final-video');
      } catch (error) {
        console.error('Failed to save form data:', error);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Scroll to first error
      const firstErrorKey = Object.keys(formErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const SectionHeader = ({ title, section }: { title: string; section: keyof typeof sections }) => (
    <div
      className="flex items-center justify-between cursor-pointer py-2 border-b dark:border-gray-700"
      onClick={() => toggleSection(section)}
    >
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      <ChevronDown
        className={`w-4 h-4 transition-transform ${sections[section] ? 'transform rotate-180' : ''}`}
      />
    </div>
  );

  const renderVocalItems = (section: string, items: VocalItem[]) => (
    <div className="space-y-4 pt-2" id={section}>
      {formSubmitted && formErrors[section] && (
        <p className="text-red-500 text-xs">* Please select an option</p>
      )}
      {items.map((item) => (
        <div key={item.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Checkbox
            id={`${section}-${item.id}`}
            checked={item.checked}
            onCheckedChange={(checked) => updateVocalSection(section, item.id, checked as boolean)}
          />
          <div className="flex-1">
            <label
              htmlFor={`${section}-${item.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {item.name}
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.duration}</p>
          <AudioPlayer 
            audioUrl={`/audio/${item.audioFile}`} 
            onPlay={(audio) => handleAudioPlay(audio, `${section}-${item.id}`)} 
            isActive={currentPlaying === `${section}-${item.id}`}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto shadow-lg rounded-md p-4 bg-white dark:bg-gray-800">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-5 mt-5 text-gray-900 dark:text-white">Catholic Service Preferences</h2>
          
          {/* Use div instead of form to prevent default form submission */}
          <div className="space-y-6">
            {/* Pre Service */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Pre Service</h3>
              <div className="bg-[#E7E7E7] dark:bg-gray-700 p-3 rounded">
                <span className="text-sm text-gray-800 dark:text-gray-200">Instrumental (20 minutes)</span>
              </div>
            </div>

            {/* Start of Rosary */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4">
              <SectionHeader title="Start of Rosary" section="startOfRosary" />
              {sections.startOfRosary && (
                renderVocalItems('startOfRosary', vocalSections.startOfRosary)
              )}
            </div>

            {/* Penitential Rite */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4" id="penitentialRite">
              <SectionHeader title="Penitential Rite" section="penitentialRite" />
              {sections.penitentialRite && (
                <div className="pt-2">
                  {formSubmitted && formErrors.penitentialRite && (
                    <p className="text-red-500 text-xs mb-1">* Please select an option</p>
                  )}
                  <Select 
                    onValueChange={(value) => handleSelectionChange(value, 'penitentialRite')}
                    value={selectionState.penitentialRite}
                  >
                    <SelectTrigger className={`w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 ${
                      formSubmitted && formErrors.penitentialRite ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                      <SelectItem value="lord-have-mercy" className="dark:text-gray-200">Lord Have Mercy Vocal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Responsorial Psalm */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4" id="responsorialPsalm">
              <SectionHeader title="Responsorial Psalm" section="responsorialPsalm" />
              {sections.responsorialPsalm && (
                <div className="pt-2">
                  {formSubmitted && formErrors.responsorialPsalm && (
                    <p className="text-red-500 text-xs mb-1">* Please select an option</p>
                  )}
                  <Select 
                    onValueChange={(value) => handleSelectionChange(value, 'responsorialPsalm')}
                    value={selectionState.responsorialPsalm}
                  >
                    <SelectTrigger className={`w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 ${
                      formSubmitted && formErrors.responsorialPsalm ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                      <SelectItem value="shepherd" className="dark:text-gray-200">The Lord is My Shepherd Vocal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Offertory Procession */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4">
              <SectionHeader title="Offertory Procession" section="offertoryProcession" />
              {sections.offertoryProcession && (
                renderVocalItems('offertoryProcession', vocalSections.offertoryProcession)
              )}
            </div>

            {/* Holy Holy */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4">
              <SectionHeader title="Holy Holy" section="holyHoly" />
              {sections.holyHoly && (
                renderVocalItems('holyHoly', vocalSections.holyHoly)
              )}
            </div>

            {/* Memorial Acclamation */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4">
              <SectionHeader title="Memorial Acclamation" section="memorialAcclamation" />
              {sections.memorialAcclamation && (
                renderVocalItems('memorialAcclamation', vocalSections.memorialAcclamation)
              )}
            </div>

            {/* The great amen */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4">
              <SectionHeader title="The Great Amen" section="greatAmen" />
              {sections.greatAmen && (
                renderVocalItems('greatAmen', vocalSections.greatAmen)
              )}
            </div>

            {/* Lamb of God */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4" id="lambOfGod">
              <SectionHeader title="Lamb of God" section="lambOfGod" />
              {sections.lambOfGod && (
                <div className="pt-2">
                  {formSubmitted && formErrors.lambOfGod && (
                    <p className="text-red-500 text-xs mb-1">* Please select an option</p>
                  )}
                  <Select 
                    onValueChange={(value) => handleSelectionChange(value, 'lambOfGod')}
                    value={selectionState.lambOfGod}
                  >
                    <SelectTrigger className={`w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 ${
                      formSubmitted && formErrors.lambOfGod ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                      <SelectItem value="communion1" className="dark:text-gray-200">Communion 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Filler music post communion */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4" id="fillerMusic">
              <SectionHeader title="Filler Music Post Communion" section="fillerMusic" />
              {sections.fillerMusic && (
                <div className="pt-2">
                  {formSubmitted && formErrors.fillerMusic && (
                    <p className="text-red-500 text-xs mb-1">* Please select an option</p>
                  )}
                  <Select 
                    onValueChange={(value) => handleSelectionChange(value, 'fillerMusic')}
                    value={selectionState.fillerMusic}
                  >
                    <SelectTrigger className={`w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 ${
                      formSubmitted && formErrors.fillerMusic ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                      <SelectItem value="instrumental" className="dark:text-gray-200">Instrumental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Final Commendation */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4" id="finalCommendation">
              <SectionHeader title="Final Commendation" section="finalCommendation" />
              {sections.finalCommendation && (
                <div className="pt-2">
                  {formSubmitted && formErrors.finalCommendation && (
                    <p className="text-red-500 text-xs mb-1">* Please select an option</p>
                  )}
                  <Select 
                    onValueChange={(value) => handleSelectionChange(value, 'finalCommendation')}
                    value={selectionState.finalCommendation}
                  >
                    <SelectTrigger className={`w-full text-sm bg-[#E7E7E7] dark:bg-gray-700 dark:text-gray-200 ${
                      formSubmitted && formErrors.finalCommendation ? 'border-red-500' : ''
                    }`}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
                      <SelectItem value="jesus" className="dark:text-gray-200">Jesus remember me vocal (mass part)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Recessional */}
            <div className="space-y-2 border dark:border-gray-700 rounded-md p-4">
              <SectionHeader title="Recessional" section="recessional" />
              {sections.recessional && (
                renderVocalItems('recessional', vocalSections.recessional)
              )}
            </div>

            {/* Additional Options */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={additionalOptions.viewingMusic}
                  onCheckedChange={(checked) => setAdditionalOptions(prev => ({ ...prev, viewingMusic: checked as boolean }))}
                  className="rounded-sm"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">Viewing music</span>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={additionalOptions.filterMusicPreMass}
                  onCheckedChange={(checked) => setAdditionalOptions(prev => ({ ...prev, filterMusicPreMass: checked as boolean }))}
                  className="rounded-sm"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">Filter Music pre-mass: Vocal</span>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={additionalOptions.placingOfSymbols}
                  onCheckedChange={(checked) => setAdditionalOptions(prev => ({ ...prev, placingOfSymbols: checked as boolean }))}
                  className="rounded-sm"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">Placing of Symbols: Vocal</span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="text-sm dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => router.back()}
              >Previous</Button>
              <Button 
                type="button" 
                className=" px-10 py-2.5 rounded-full  font-medium bg-[#3F72AF] hover:bg-[#172e4b] text-white"
                onClick={handleNextClick}
                disabled={isSaving}
              >{isSaving ? 'Saving...' : 'Next'}</Button>
            </div>
            
            {/* Summary of errors if form was submitted with errors */}
            {formSubmitted && Object.keys(formErrors).length > 0 && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-md mt-4">
                <p className="text-red-600 font-medium">Please complete all required fields before continuing.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}