// src/app/forms/builder/[id]/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Settings, Trash2, PlusSquare, Type, Mail, Phone, List, CheckSquare, Radio, Loader2, GripVertical } from 'lucide-react'; // Added GripVertical
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch'; // Use Switch for boolean toggles like 'required'
import { ScrollArea } from '@/components/ui/scroll-area'; // For scrollable panels
import { cn } from "@/lib/utils";

// Define available field types
const availableFieldTypes = [
    { type: 'text', label: 'Text Input', icon: Type, defaultProps: { placeholder: 'Enter text...' } },
    { type: 'email', label: 'Email', icon: Mail, defaultProps: { placeholder: 'you@example.com' } },
    { type: 'textarea', label: 'Text Area', icon: List, defaultProps: { placeholder: 'Enter longer text...' } },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, defaultProps: { label: 'Checkbox Label' } },
    // Add more types like select, radio, phone later
];

// --- Reusable Builder Components ---

// Represents a single field in the builder canvas
const BuilderFieldItem = ({ fieldData, onSelect, onRemove, isSelected }) => {

    return (
        <Card 
            className={cn(
                "mb-3 p-4 border border-muted relative group cursor-pointer hover:border-primary/50 transition-colors",
                isSelected && "border-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
            )}
            onClick={() => onSelect(fieldData.id)} // Select on click
        >
            <div className="flex items-start justify-between gap-2">
                {/* Field Label and Required Indicator */}
                <div className="flex-1">
                    <Label className="font-medium text-base">{fieldData.label || `Untitled ${fieldData.type}`}</Label>
                     {fieldData.required && <span className="text-xs text-destructive ml-1">(Required)</span>}
                     {fieldData.placeholder && fieldData.type !== 'checkbox' && <p className="text-xs text-muted-foreground mt-1">Placeholder: {fieldData.placeholder}</p>}
                </div>
                {/* Action Buttons */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {/* Placeholder for Drag Handle if DND is added */}
                     <Button variant="ghost" size="icon" className="h-7 w-7 cursor-default" title="Configure Field (Selected)">
                        <Settings className="h-4 w-4"/>
                    </Button>
                     <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Remove Field">
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            </div>
        </Card>
    );
}

// Panel to configure the selected field's properties
const FieldConfigPanel = ({ fieldData, onUpdate }) => {
     if (!fieldData) return (
          <div className="p-4 border-l h-full text-muted-foreground text-sm flex items-center justify-center">
             Select a field on the left to configure its properties.
         </div>
     );

    // Specific update handlers to avoid excessive re-renders on every keystroke
     const handlePropChange = (propName, value) => {
         onUpdate({ ...fieldData, [propName]: value });
     };
     
     const handleCheckedChange = (propName, checked) => {
        onUpdate({ ...fieldData, [propName]: !!checked });
     };

     return (
         <ScrollArea className="h-full border-l bg-background">
            <div className="p-4 space-y-6">
                <h3 className="font-semibold text-lg">Configure Field</h3>
                <Separator className="mb-4"/>
                
                {/* Field Type Display */} 
                <div className="text-sm">
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium capitalize">{fieldData.type}</span>
                </div>

                {/* General Properties */}
                <div className="space-y-4">
                     <h4 className="font-medium text-sm text-muted-foreground">General</h4>
                    <div className="grid gap-1.5">
                        <Label htmlFor={`config-label-${fieldData.id}`}>Label / Question</Label>
                        <Input 
                            id={`config-label-${fieldData.id}`} 
                            value={fieldData.label || ''} // Controlled component now
                            onChange={(e) => handlePropChange('label', e.target.value)}
                            key={`${fieldData.id}-label`} // Key helps React manage state if needed
                         />
                    </div>
                    
                    {/* Placeholder only applicable to certain types */}
                    {(fieldData.type === 'text' || fieldData.type === 'email' || fieldData.type === 'textarea') && (
                        <div className="grid gap-1.5">
                            <Label htmlFor={`config-placeholder-${fieldData.id}`}>Placeholder</Label>
                            <Input 
                                id={`config-placeholder-${fieldData.id}`} 
                                value={fieldData.placeholder || ''} 
                                onChange={(e) => handlePropChange('placeholder', e.target.value)}
                                key={`${fieldData.id}-placeholder`}
                            />
                        </div>
                    )}

                     {/* Required toggle */}
                     <div className="flex items-center space-x-2 pt-2">
                          <Switch 
                             id={`config-required-${fieldData.id}`} 
                             checked={!!fieldData.required} 
                             onCheckedChange={(checked) => handleCheckedChange('required', checked)} 
                             key={`${fieldData.id}-required`}
                          />
                          <Label htmlFor={`config-required-${fieldData.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              Required Field
                          </Label>
                     </div>
                </div>

                 {/* Add more config sections based on field type here */} 

            </div>
        </ScrollArea>
     );
}

// --- Main Form Builder Page Component ---

const FormBuilderPage = () => {
    const params = useParams();
    const router = useRouter();
    const formIdParam = params.id === 'new' ? null : params.id; 
    const isNewForm = !formIdParam;

    const [formTitle, setFormTitle] = useState('Untitled Form');
    const [formDescription, setFormDescription] = useState('');
    const [fields, setFields] = useState([]); 
    const [selectedFieldId, setSelectedFieldId] = useState(null); 
    const [isLoading, setIsLoading] = useState(!isNewForm); 
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formStatus, setFormStatus] = useState('draft'); 

    // --- Data Fetching and Saving --- 
    const loadFormData = useCallback(async () => {
         if (isNewForm) {
             setIsLoading(false);
             setFormTitle('Untitled Form');
             setFormDescription('');
             setFields([]);
             setFormStatus('draft');
             setSelectedFieldId(null);
             return;
         };
         
        setIsLoading(true);
        setError(null);
        console.log(`Fetching form builder data for ID: ${formIdParam}`);
        try {
            const response = await fetch(`/api/forms/${formIdParam}`);
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || `Failed to load form (${response.status})`);
            }
            const data = await response.json();
             if (!data.form) throw new Error('Form data not found in API response');
            
            setFormTitle(data.form.title || 'Untitled Form');
            setFormDescription(data.form.description || '');
            let parsedFields = [];
            if (typeof data.form.fields === 'string') {
                try {
                    parsedFields = JSON.parse(data.form.fields);
                    if (!Array.isArray(parsedFields)) parsedFields = []; // Ensure it's an array
                } catch (parseError) {
                    console.error("Failed to parse fields JSON:", parseError);
                    throw new Error("Invalid fields data received from server.");
                }
            } else if (Array.isArray(data.form.fields)) {
                 parsedFields = data.form.fields;
            }
            setFields(parsedFields);
            setFormStatus(data.form.is_published ? 'published' : 'draft');
            setSelectedFieldId(null);
            console.log("Form data loaded:", data.form);
        } catch (err) {
            console.error("Error loading form builder:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [formIdParam, isNewForm]);

    useEffect(() => {
        loadFormData();
    }, [loadFormData]); 

    const handleSaveForm = async () => {
        setIsSaving(true);
        setError(null);
        const url = isNewForm ? `/api/forms` : `/api/forms/${formIdParam}`; // API endpoint for form creation/update
        const method = isNewForm ? 'POST' : 'PUT';
        
        const payload = {
            title: formTitle,
            description: formDescription,
            fields: JSON.stringify(fields), // Always stringify fields for consistency
            is_published: formStatus === 'published',
            // Assuming API handles 'form_type', or add it here if needed
        };
        console.log("Saving form...", { url, method, payload });

        try {
            const response = await fetch(url, { 
                method, 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });
            
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.error || `Failed to save form (${response.status})`);
            }
            const result = await response.json();
            console.log('Save successful:', result);
            
            if (isNewForm && result.form?.id) { 
                // Replace URL without full page reload after creation
                router.replace(`/forms/builder/${result.form.id}`, { scroll: false });
                 // Optionally show success feedback
                 alert('Form created successfully!');
            } else {
                 alert('Form saved successfully!');
            }
             // Optionally refetch data to confirm save, though state is updated optimistically
            // loadFormData(); 

        } catch (err) {
            console.error("Error saving form:", err);
            setError(err.message);
            alert(`Error saving form: ${err.message}`); 
        } finally {
            setIsSaving(false);
        }
    }

    // --- Field Management --- 
    const addField = (type) => {
        const fieldTypeConfig = availableFieldTypes.find(ft => ft.type === type);
        if (!fieldTypeConfig) return;

        const newField = {
            id: `field_${Date.now()}_${Math.random().toString(16).slice(2)}`, 
            type: type,
            label: `Untitled ${fieldTypeConfig.label}`,
            required: false,
            ...(fieldTypeConfig.defaultProps || {})
        };
        setFields(currentFields => [...currentFields, newField]);
        setSelectedFieldId(newField.id); 
    };

    const updateField = (updatedFieldData) => {
        setFields(currentFields => currentFields.map(f => f.id === updatedFieldData.id ? updatedFieldData : f));
    };

    const removeField = (idToRemove) => {
        setFields(currentFields => currentFields.filter(f => f.id !== idToRemove));
        if (selectedFieldId === idToRemove) {
            setSelectedFieldId(null); 
        }
    };

    const selectedFieldData = fields.find(f => f.id === selectedFieldId);

    // --- Render Logic --- 
    if (isLoading) {
         return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> Loading Builder...</div>;
    }
     if (error) {
          return (
            <div className="flex flex-col h-screen items-center justify-center text-destructive p-4">
                <p className="mb-4">Error loading form: {error}</p>
                 <Button onClick={loadFormData}>Retry</Button>
                  <Button variant="link" onClick={() => router.push('/forms')} className="mt-2">Go back to Forms List</Button>
            </div>
            );
     }

    return (
        <div className="flex flex-col h-screen bg-muted/10"> {/* Lighter background */} 
            {/* Header */}
            <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
                 <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.push('/forms')}> 
                     <ArrowLeft className="h-4 w-4" />
                     <span className="sr-only">Back to Forms</span>
                 </Button>
                <div className="flex-1">
                    <Input 
                        value={formTitle} 
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="text-lg font-semibold md:text-xl border-none shadow-none focus-visible:ring-0 bg-transparent h-auto p-0"
                        placeholder="Enter Form Title"
                    />
                </div>
                <div className="flex items-center gap-2">
                     {/* Add Preview Button - Placeholder action */}
                    <Button variant="outline" size="sm" onClick={() => alert('Preview not implemented')}>
                        <Eye className="h-4 w-4 mr-2" /> Preview
                    </Button>
                     <Button size="sm" onClick={handleSaveForm} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Form'}
                    </Button>
                </div>
            </header>

            {/* Main Content Grid */} 
            <main className="flex-1 grid grid-cols-[240px_1fr_320px] gap-0 overflow-hidden"> 
                
                {/* 1. Available Fields Panel */} 
                 <ScrollArea className="h-full border-r bg-background">
                    <div className="p-4">
                        <h3 className="font-semibold mb-4 text-base">Add Fields</h3>
                        <div className="grid gap-2">
                            {availableFieldTypes.map(ft => (
                                <Button 
                                    key={ft.type} 
                                    variant="outline" 
                                    size="sm" 
                                    className="justify-start gap-2 text-muted-foreground hover:text-foreground"
                                    onClick={() => addField(ft.type)}
                                >
                                    <ft.icon className="h-4 w-4"/> {ft.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                 </ScrollArea>

                {/* 2. Form Preview / Drop Area */} 
                <ScrollArea className="h-full bg-muted/40">
                    <div className="p-6 lg:p-8 max-w-2xl mx-auto"> {/* Center content */} 
                        
                         {fields.length === 0 && (
                             <div className="text-center text-muted-foreground py-16 border-2 border-dashed border-border rounded-lg">
                                 Click fields from the left panel to add them here.
                             </div>
                         )}

                         {/* Render Added Fields */} 
                         <div>
                             {fields.map(field => (
                                <BuilderFieldItem 
                                    key={field.id} 
                                    id={field.id} 
                                    fieldData={field} 
                                    onSelect={setSelectedFieldId} 
                                    onRemove={() => removeField(field.id)} 
                                    isSelected={selectedFieldId === field.id}
                                />
                            ))}
                         </div>
                    </div>
                 </ScrollArea>

                {/* 3. Field Configuration Panel */} 
                 <FieldConfigPanel 
                    key={selectedFieldId} // Force re-render panel when selected field changes
                    fieldData={selectedFieldData} 
                    onUpdate={updateField} 
                />
            </main>
        </div>
    );
};

export default FormBuilderPage;
