'use client';

import Card from './Card';

export default function ColorTest() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-primary">Color Test Component</h1>
      
      <Card padding="lg">
        <h2 className="text-2xl font-semibold text-primary mb-4">Text Color Tests</h2>
        
        <div className="space-y-3">
          <p className="text-primary">Primary text color - should be dark in light mode, light in dark mode</p>
          <p className="text-secondary">Secondary text color - should be medium gray</p>
          <p className="text-muted">Muted text color - should be light gray</p>
          <p className="text-white bg-black p-2 rounded">White text on black background</p>
          <p className="text-black bg-white p-2 rounded border">Black text on white background</p>
        </div>
        
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-primary">Role Colors</h3>
          <p className="text-faculty">Faculty text color (blue)</p>
          <p className="text-security">Security text color (green)</p>
          <p className="text-hod">HOD text color (purple)</p>
          <p className="text-security-head">Security Head text color (yellow/orange)</p>
        </div>
        
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-primary">Status Colors</h3>
          <p className="text-success">Success text color (green)</p>
          <p className="text-warning">Warning text color (yellow/orange)</p>
          <p className="text-danger">Danger text color (red)</p>
          <p className="text-info">Info text color (blue)</p>
        </div>
        
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold text-primary">Headings Test</h3>
          <h1 className="text-4xl font-bold">H1 Heading</h1>
          <h2 className="text-3xl font-bold">H2 Heading</h2>
          <h3 className="text-2xl font-bold">H3 Heading</h3>
          <h4 className="text-xl font-bold">H4 Heading</h4>
          <h5 className="text-lg font-bold">H5 Heading</h5>
          <h6 className="text-base font-bold">H6 Heading</h6>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-primary mb-3">Paragraph Test</h3>
          <p>
            This is a regular paragraph with normal text. It should inherit the proper text color 
            from the theme system. The text should be clearly readable with good contrast against 
            the background in both light and dark modes.
          </p>
          <p className="mt-3">
            <span>This is a span element inside a paragraph.</span> It should also have proper 
            text color inheritance.
          </p>
        </div>
      </Card>
      
      <Card padding="lg" className="bg-gray-900 text-white">
        <h2 className="text-2xl font-semibold mb-4">Dark Background Test</h2>
        <p>This card has a dark background with white text to test contrast.</p>
        <p className="text-gray-300 mt-2">This text should be light gray on the dark background.</p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card role="faculty" padding="md">
          <h3 className="font-semibold text-faculty mb-2">Faculty Card</h3>
          <p className="text-sm">This card uses faculty role styling.</p>
        </Card>
        
        <Card role="security" padding="md">
          <h3 className="font-semibold text-security mb-2">Security Card</h3>
          <p className="text-sm">This card uses security role styling.</p>
        </Card>
        
        <Card role="hod" padding="md">
          <h3 className="font-semibold text-hod mb-2">HOD Card</h3>
          <p className="text-sm">This card uses HOD role styling.</p>
        </Card>
        
        <Card role="security-head" padding="md">
          <h3 className="font-semibold text-security-head mb-2">Security Head Card</h3>
          <p className="text-sm">This card uses security head role styling.</p>
        </Card>
      </div>
    </div>
  );
}
