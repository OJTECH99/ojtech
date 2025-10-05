import React, { Component } from 'react';
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/Form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select";
import { Loader2 } from "lucide-react";

// Company size options
const companySizeOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-20", label: "11-20 employees" },
  { value: "21-30", label: "21-30 employees" },
  { value: "31-40", label: "31-40 employees" },
  { value: "41+", label: "41+ employees" }
];

interface FormValues {
  companyName: string;
  companyWebsite: string;
  companySize: string;
  industry: string;
  companyDescription: string;
}

interface CompanyInfoFormProps {
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  isLoading?: boolean;
}

interface CompanyInfoFormState {
  formData: FormValues;
  errors: Partial<Record<keyof FormValues, string>>;
  touched: Partial<Record<keyof FormValues, boolean>>;
}

export class CompanyInfoForm extends Component<CompanyInfoFormProps, CompanyInfoFormState> {
  constructor(props: CompanyInfoFormProps) {
    super(props);
    this.state = {
      formData: {
        companyName: props.initialData?.companyName || '',
        companyWebsite: props.initialData?.companyWebsite || '',
        companySize: props.initialData?.companySize || '',
        industry: props.initialData?.industry || '',
        companyDescription: props.initialData?.companyDescription || ''
      },
      errors: {},
      touched: {}
    };
  }

  handleChange = (name: keyof FormValues, value: string) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [name]: value
      },
      touched: {
        ...prevState.touched,
        [name]: true
      }
    }), () => this.validateField(name));
  };

  handleSelectChange = (name: keyof FormValues, value: string) => {
    this.handleChange(name, value);
  };

  validateField = (name: keyof FormValues) => {
    const { formData } = this.state;
    let error = '';

    switch (name) {
      case 'companyWebsite':
        if (formData.companyWebsite && !formData.companyWebsite.match(/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/\S*)?$/)) {
          error = 'Please enter a valid URL';
        }
        break;
      case 'companySize':
        if (!formData.companySize) {
          error = 'Please select a company size';
        }
        break;
      case 'industry':
        if (!formData.industry) {
          error = 'Please enter an industry';
        }
        break;
      case 'companyDescription':
        if (!formData.companyDescription) {
          error = 'Please provide a company description';
        } else if (formData.companyDescription.length < 50) {
          error = 'Description must be at least 50 characters';
        }
        break;
      default:
        break;
    }

    this.setState(prevState => ({
      errors: {
        ...prevState.errors,
        [name]: error
      }
    }));

    return error === '';
  };

  validateForm = () => {
    const fields: Array<keyof FormValues> = ['companySize', 'industry', 'companyDescription'];
    
    // Mark all fields as touched
    const touched = fields.reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {});
    
    this.setState({ touched });
    
    // Validate all fields
    const isValid = fields.every(field => this.validateField(field));
    
    return isValid;
  };

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (this.validateForm()) {
      this.props.onSubmit(this.state.formData);
    }
  };

  render() {
    const { formData, errors, touched } = this.state;
    const { isLoading } = this.props;
    
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Company Information</h2>
          <p className="text-gray-500">Tell us about your company to help attract the right candidates</p>
        </div>
        
        {formData.companyName && (
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-medium text-lg">Company Name</h3>
            <p className="text-muted-foreground">{formData.companyName}</p>
          </div>
        )}
        
        <Form>
          <form onSubmit={this.handleSubmit} className="space-y-8">
            <FormField name="companyWebsite">
              <FormItem>
                <FormLabel>Company Website</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://www.example.com" 
                    value={formData.companyWebsite}
                    onChange={e => this.handleChange('companyWebsite', e.target.value)}
                  />
                </FormControl>
                <FormDescription>Optional but recommended</FormDescription>
                {touched.companyWebsite && errors.companyWebsite && (
                  <FormMessage>{errors.companyWebsite}</FormMessage>
                )}
              </FormItem>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="companySize">
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <Select 
                    value={formData.companySize}
                    onValueChange={value => this.handleSelectChange('companySize', value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companySizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {touched.companySize && errors.companySize && (
                    <FormMessage>{errors.companySize}</FormMessage>
                  )}
                </FormItem>
              </FormField>

              <FormField name="industry">
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter industry"
                      value={formData.industry}
                      onChange={e => this.handleChange('industry', e.target.value)}
                    />
                  </FormControl>
                  {touched.industry && errors.industry && (
                    <FormMessage>{errors.industry}</FormMessage>
                  )}
                </FormItem>
              </FormField>
            </div>

            <FormField name="companyDescription">
              <FormItem>
                <FormLabel>Company Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your company, its mission, and what makes it unique..."
                    value={formData.companyDescription}
                    onChange={e => this.handleChange('companyDescription', e.target.value)}
                    rows={5}
                  />
                </FormControl>
                <FormDescription>
                  This will be visible to candidates applying for your jobs
                </FormDescription>
                {touched.companyDescription && errors.companyDescription && (
                  <FormMessage>{errors.companyDescription}</FormMessage>
                )}
              </FormItem>
            </FormField>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </Form>
      </div>
    );
  }
}
