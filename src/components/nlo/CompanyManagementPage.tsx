import React, { useState, useEffect } from 'react';
import { Plus, Search, Building2, Mail, Phone, MapPin, Users, Globe, Edit, ToggleLeft, ToggleRight, FileText, X as XIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { useToast } from '../../components/ui/use-toast';
import nloService, { Company, CompanyCreateRequest } from '../../lib/api/nloService';
import apiClient from '../../lib/api/apiClient';

const CompanyManagementPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { toast } = useToast();
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CompanyCreateRequest>({
    name: '',
    website: '',
    description: '',
    location: '',
    email: '',
    phone: '',
    industry: '',
    companySize: '',
    logoUrl: '',
    hrName: '',
    hrEmail: '',
    hrPhone: '',
  });

  useEffect(() => {
    fetchCompanies();
    // Load form data from localStorage on mount
    const savedFormData = localStorage.getItem('companyFormDraft');
    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, showActiveOnly]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await nloService.getAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({ title: 'Failed to fetch companies', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    if (showActiveOnly) {
      filtered = filtered.filter(company => company.active);
    }

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      website: '',
      description: '',
      location: '',
      email: '',
      phone: '',
      industry: '',
      companySize: '',
      logoUrl: '',
      hrName: '',
      hrEmail: '',
      hrPhone: '',
    });
    // Clear localStorage when resetting form
    localStorage.removeItem('companyFormDraft');
  };

  // Save form data to localStorage whenever it changes
  const updateFormData = (updates: Partial<CompanyCreateRequest>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    // Save to localStorage
    localStorage.setItem('companyFormDraft', JSON.stringify(newFormData));
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await nloService.createCompany(formData);
      toast({ title: 'Company created successfully', variant: 'success' });
      setIsCreateDialogOpen(false);
      resetForm(); // This will also clear localStorage
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      toast({ title: 'Failed to create company', variant: 'destructive' });
    }
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    try {
      await nloService.updateCompany(editingCompany.id, formData);
      toast({ title: 'Company updated successfully', variant: 'success' });
      setIsEditDialogOpen(false);
      setEditingCompany(null);
      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
      toast({ title: 'Failed to update company', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (company: Company) => {
    try {
      if (company.active) {
        await nloService.deactivateCompany(company.id);
        toast({ title: 'Company deactivated successfully', variant: 'success' });
      } else {
        await nloService.activateCompany(company.id);
        toast({ title: 'Company activated successfully', variant: 'success' });
      }
      fetchCompanies();
    } catch (error) {
      console.error('Error toggling company status:', error);
      toast({ title: 'Failed to update company status', variant: 'destructive' });
    }
  };

  const openEditDialog = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      website: company.website || '',
      description: company.description || '',
      location: company.location || '',
      email: company.email,
      phone: company.phone || '',
      industry: company.industry || '',
      companySize: company.companySize || '',
      logoUrl: company.logoUrl || '',
      hrName: company.hrName || '',
      hrEmail: company.hrEmail || '',
      hrPhone: company.hrPhone || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    setUploadingLogo(true);
    try {
      // Get Cloudinary params
      const { data: cloudParams } = await apiClient.get('/public/cloudinary/company-logo-params');

      // Upload to Cloudinary - only include signed parameters
      const cloudForm = new FormData();
      cloudForm.append('file', file);
      cloudForm.append('api_key', cloudParams.apiKey);
      cloudForm.append('timestamp', String(cloudParams.timestamp));
      cloudForm.append('signature', cloudParams.signature);
      cloudForm.append('folder', cloudParams.folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudParams.cloudName}/image/upload`;
      const cloudRes = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: cloudForm,
      });

      const cloudJson = await cloudRes.json();
      if (!cloudRes.ok) {
        throw new Error(cloudJson?.error?.message || 'Upload failed');
      }

      const uploadedUrl = cloudJson.secure_url || cloudJson.url;
      setFormData({ ...formData, logoUrl: uploadedUrl });
      toast({ title: 'Logo uploaded successfully', variant: 'success' });
    } catch (error: any) {
      console.error('Logo upload error:', error);
      const errorMsg = error?.message || 'Failed to upload logo';
      toast({ title: errorMsg, variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const CompanyForm = ({ onSubmit, submitText }: { onSubmit: (e: React.FormEvent) => void; submitText: string }) => (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Company Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Company Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              required
              placeholder="Enter company name"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                required
                placeholder="company@example.com"
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={formData.website}
                onChange={(e) => updateFormData({ website: e.target.value })}
                placeholder="https://example.com"
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Industry</label>
            <Input
              value={formData.industry}
              onChange={(e) => updateFormData({ industry: e.target.value })}
              placeholder="e.g., Technology, Finance"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Company Size</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={formData.companySize}
                onChange={(e) => updateFormData({ companySize: e.target.value })}
                placeholder="e.g., 50-100 employees"
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={formData.location}
                onChange={(e) => updateFormData({ location: e.target.value })}
                placeholder="123 Main St, City, Country"
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Logo</h3>
        </div>
        <div className="space-y-3">
          {formData.logoUrl && (
            <div className="relative w-32 h-32 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white">
              <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => updateFormData({ logoUrl: '' })}
                className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="flex-1"
            />
            {uploadingLogo && (
              <span className="text-sm text-blue-600 font-medium flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Or enter logo URL manually:</p>
          <Input
            value={formData.logoUrl}
            onChange={(e) => updateFormData({ logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
            className="w-full"
          />
        </div>
      </div>

      {/* HR Contact Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Mail className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">HR Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">HR Name</label>
            <Input
              value={formData.hrName}
              onChange={(e) => updateFormData({ hrName: e.target.value })}
              placeholder="John Doe"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">HR Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                value={formData.hrEmail}
                onChange={(e) => updateFormData({ hrEmail: e.target.value })}
                placeholder="hr@company.com"
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">HR Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={formData.hrPhone}
                onChange={(e) => updateFormData({ hrPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Description</h3>
        </div>
        <textarea
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
          rows={4}
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Tell us about your company..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }}
          className="px-6"
        >
          Cancel
        </Button>
        <Button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700">
          {submitText}
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage partner company profiles</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant={showActiveOnly ? "default" : "outline"}
              onClick={() => setShowActiveOnly(!showActiveOnly)}
            >
              {showActiveOnly ? "Show All" : "Active Only"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {company.logoUrl ? (
                    <img src={company.logoUrl} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <Badge variant={company.active ? "default" : "secondary"}>
                      {company.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(company)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(company)}
                  >
                    {company.active ? (
                      <ToggleRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  {company.email}
                </div>
                {company.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {company.phone}
                  </div>
                )}
                {company.location && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {company.location}
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Globe className="w-4 h-4 mr-2" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Website
                    </a>
                  </div>
                )}
                {company.industry && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    {company.industry}
                  </div>
                )}
              </div>

              {(company.hrName || company.hrEmail || company.hrPhone) && (
                <div className="border-t pt-3">
                  <h5 className="text-sm font-medium mb-2">HR Contact</h5>
                  <div className="space-y-1">
                    {company.hrName && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{company.hrName}</div>
                    )}
                    {company.hrEmail && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{company.hrEmail}</div>
                    )}
                    {company.hrPhone && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{company.hrPhone}</div>
                    )}
                  </div>
                </div>
              )}

              {company.description && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {company.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No companies found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first company"}
          </p>
        </div>
      )}

      {/* Create Company Modal */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Company</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <CompanyForm onSubmit={handleCreateCompany} submitText="Create Company" />
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Company</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingCompany(null);
                  resetForm();
                }}
                className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <CompanyForm onSubmit={handleEditCompany} submitText="Update Company" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagementPage;
