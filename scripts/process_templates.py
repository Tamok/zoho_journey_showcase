#!/usr/bin/env python3
"""
Email Template Processor for Zoho Campaigns Journey Showcase

This script processes ZIP files containing email templates and creates reminder variations.
It extracts email content, modifies text for reminder emails, and organizes files for the website.

Usage:
    python process_templates.py [program_name]

Example:
    python process_templates.py pm
"""

import sys
import zipfile
import shutil
import re
from pathlib import Path
from typing import Dict, List, Tuple
import json

class EmailTemplateProcessor:
    def __init__(self, program_name: str):
        self.program_name = program_name
        self.base_dir = Path(__file__).parent.parent
        self.journeys_dir = self.base_dir / "journeys" / program_name
        self.processed_dir = self.base_dir / "website" / "processed_emails" / program_name
        self.website_dir = self.base_dir / "website"
        
        # Text modifications for reminder emails
        self.reminder_modifications = {
            "welcome": {
                "original": "Gain the skills and tools you need",
                "reminder": "Don't miss out! Gain the skills and tools you need"
            },
            "highlights": {
                "original": "Discover what makes our program unique",
                "reminder": "Still time to discover what makes our program unique"
            },
            "structure": {
                "original": "Deep dive into our comprehensive curriculum", 
                "reminder": "Last chance to explore our comprehensive curriculum"
            },
            "insights": {
                "original": "Stay ahead with current industry knowledge",
                "reminder": "Don't fall behind - stay ahead with current industry knowledge"
            },
            "career": {
                "original": "Explore your career advancement potential",
                "reminder": "Time is running out to explore your career advancement potential"
            },
            "testimonials": {
                "original": "Real stories from successful graduates",
                "reminder": "See how our graduates succeeded - read their stories"
            },
            "offer": {
                "original": "Limited time special offer just for you",
                "reminder": "FINAL HOURS - Limited time special offer just for you"
            },
            "updates": {
                "original": "Latest program enhancements and benefits",
                "reminder": "New benefits added - check out the latest program enhancements"
            },
            "final": {
                "original": "Your final opportunity to join us",
                "reminder": "LAST CALL - Your final opportunity to join us"
            }
        }
        
        # Subject line prefixes for reminders
        self.reminder_prefixes = [
            "Reminder: ",
            "Don't Miss: ",
            "Last Chance: ",
            "Final Notice: ",
            "⏰ ",
            "🔔 "
        ]

    def setup_directories(self):
        """Create necessary directories if they don't exist."""
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        (self.processed_dir / "emails").mkdir(exist_ok=True)
        (self.processed_dir / "images").mkdir(exist_ok=True)
        (self.processed_dir / "metadata").mkdir(exist_ok=True)

    def extract_template(self, zip_path: Path, email_number: int) -> Dict:
        """Extract a single email template from ZIP file."""
        extract_dir = self.processed_dir / f"temp_extract_{email_number}"
        extract_dir.mkdir(exist_ok=True)
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # Find HTML file and images
            html_files = list(extract_dir.glob("*.html"))
            image_files = list(extract_dir.glob("*.png")) + list(extract_dir.glob("*.jpg")) + list(extract_dir.glob("*.jpeg"))
            
            if not html_files:
                raise FileNotFoundError(f"No HTML file found in {zip_path}")
            
            html_file = html_files[0]
            
            # Read HTML content
            with open(html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
              # Copy images to processed directory
            image_info = []
            for img_file in image_files:
                dest_path = self.processed_dir / "images" / f"{email_number}_{img_file.name}"
                shutil.copy2(img_file, dest_path)
                
                # Create relative path from website root to the image
                relative_path = f"../processed_emails/{self.program_name}/images/{dest_path.name}"
                
                image_info.append({
                    "original": img_file.name,
                    "processed": dest_path.name,
                    "path": relative_path
                })
              # Replace image URLs in HTML content
            html_content = self.replace_image_urls(html_content, image_info)
            
            # Clean up temporary directory
            shutil.rmtree(extract_dir)
            
            return {
                "email_number": email_number,
                "html_content": html_content,
                "images": image_info,
                "original_file": str(zip_path)
            }
            
        except Exception as e:
            if extract_dir.exists():
                shutil.rmtree(extract_dir)
            raise e

    def create_reminder_variation(self, original_data: Dict) -> Dict:
        """Create reminder variation of an email."""
        html_content = original_data["html_content"]
        email_number = original_data["email_number"]
          # Modify HTML content for reminder
        modified_html = self.modify_html_for_reminder(html_content, email_number)
        
        # Replace image URLs in the modified HTML as well
        modified_html = self.replace_image_urls(modified_html, original_data["images"])
        
        # Create new data structure for reminder
        reminder_data = original_data.copy()
        reminder_data["email_number"] = f"{email_number}a"
        reminder_data["html_content"] = modified_html
        reminder_data["is_reminder"] = True
        reminder_data["original_email"] = email_number
        
        return reminder_data

    def modify_html_for_reminder(self, html_content: str, email_number: int) -> str:
        """Modify HTML content to create reminder variation."""
        modified_html = html_content
        
        # Add reminder banner at the top
        reminder_banner = '''
        <div style="background: #fef3cd; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b; text-align: center;">
            <strong style="color: #92400e;">⏰ Reminder: We noticed you haven't opened our previous email yet!</strong>
            <p style="color: #92400e; margin: 5px 0 0 0;">Don't miss out on this important information.</p>
        </div>
        '''
        
        # Insert banner after opening body tag
        body_start = modified_html.find('<body')
        if body_start != -1:
            body_end = modified_html.find('>', body_start) + 1
            modified_html = (modified_html[:body_end] + 
                           reminder_banner + 
                           modified_html[body_end:])
        
        # Modify specific text content based on email number
        text_modifications = self.get_text_modifications_for_email(email_number)
        
        for original, reminder in text_modifications.items():
            # Use case-insensitive replacement
            pattern = re.compile(re.escape(original), re.IGNORECASE)
            modified_html = pattern.sub(reminder, modified_html)
        
        # Add urgency to CTA buttons
        cta_patterns = [
            (r'(Learn More)', r'Don\'t Miss Out - \1'),
            (r'(Enroll Now)', r'Last Chance - \1'),
            (r'(Get Started)', r'Act Now - \1'),
            (r'(Sign Up)', r'Join Today - \1')
        ]
        
        for pattern, replacement in cta_patterns:
            modified_html = re.sub(pattern, replacement, modified_html, flags=re.IGNORECASE)
        
        # Add pulsing animation to buttons
        button_style = '''
        <style>
        .reminder-cta {
            animation: reminderPulse 2s infinite;
        }
        @keyframes reminderPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        </style>
        '''
        
        # Insert style before closing head tag
        head_end = modified_html.find('</head>')
        if head_end != -1:
            modified_html = (modified_html[:head_end] + 
                           button_style + 
                           modified_html[head_end:])
        
        return modified_html

    def get_text_modifications_for_email(self, email_number: int) -> Dict[str, str]:
        """Get text modifications specific to an email number."""
        modification_map = {
            1: self.reminder_modifications["welcome"],
            2: self.reminder_modifications["highlights"], 
            3: self.reminder_modifications["structure"],
            4: self.reminder_modifications["insights"],
            5: self.reminder_modifications["career"],
            6: self.reminder_modifications["testimonials"],
            7: self.reminder_modifications["offer"],
            8: self.reminder_modifications["updates"],
            9: self.reminder_modifications["final"]
        }
        
        return modification_map.get(email_number, {})

    def save_processed_email(self, email_data: Dict):
        """Save processed email data to files."""
        email_number = email_data["email_number"]
        
        # Save HTML content
        html_file = self.processed_dir / "emails" / f"template_{email_number}.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(email_data["html_content"])
        
        # Save metadata
        metadata = {
            "email_number": email_number,
            "images": email_data["images"],
            "original_file": email_data.get("original_file", ""),
            "is_reminder": email_data.get("is_reminder", False),
            "original_email": email_data.get("original_email", None),
            "program": self.program_name
        }
        
        metadata_file = self.processed_dir / "metadata" / f"template_{email_number}.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)

    def create_index_file(self, processed_emails: List[Dict]):
        """Create index file with all processed emails."""
        index_data = {
            "program": self.program_name,
            "processed_date": str(Path().absolute()),
            "emails": {}
        }
        
        for email_data in processed_emails:
            email_number = email_data["email_number"]
            index_data["emails"][str(email_number)] = {
                "html_file": f"emails/template_{email_number}.html",
                "metadata_file": f"metadata/template_{email_number}.json",
                "images": email_data["images"],
                "is_reminder": email_data.get("is_reminder", False)
            }
        
        index_file = self.processed_dir / "index.json"
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, indent=2)

    def process_all_templates(self):
        """Process all email templates for the program."""
        print(f"Processing templates for {self.program_name} program...")
        
        # Setup directories
        self.setup_directories()
        
        if not self.journeys_dir.exists():
            raise FileNotFoundError(f"Journeys directory not found: {self.journeys_dir}")
        
        # Find all template ZIP files
        zip_files = list(self.journeys_dir.glob("template (*.zip"))
        
        if not zip_files:
            raise FileNotFoundError(f"No template ZIP files found in {self.journeys_dir}")
        
        print(f"Found {len(zip_files)} template files")
        
        processed_emails = []
        
        # Process main emails (1-9)
        for i in range(1, 10):
            zip_pattern = f"template ({i}).zip"
            zip_files_for_number = [f for f in zip_files if f.name == zip_pattern]
            
            if zip_files_for_number:
                zip_file = zip_files_for_number[0]
                print(f"Processing email {i}: {zip_file.name}")
                
                try:
                    # Process main email
                    email_data = self.extract_template(zip_file, i)
                    self.save_processed_email(email_data)
                    processed_emails.append(email_data)
                    
                    # Create reminder variation
                    reminder_data = self.create_reminder_variation(email_data)
                    self.save_processed_email(reminder_data)
                    processed_emails.append(reminder_data)
                    
                    print(f"  ✓ Main email and reminder variation created")
                    
                except Exception as e:
                    print(f"  ✗ Error processing email {i}: {e}")
                    continue
            else:
                print(f"  ⚠ Template file not found for email {i}")
        
        # Create index file
        self.create_index_file(processed_emails)
        
        print(f"\nProcessing complete!")
        print(f"Processed {len(processed_emails)} emails total")
        print(f"Output directory: {self.processed_dir}")
        
        return processed_emails

    def replace_image_urls(self, html_content: str, image_info: List[Dict]) -> str:
        """Replace image URLs in HTML content with local relative paths."""
        modified_html = html_content
        
        for img in image_info:
            # Extract the image filename from the original path
            original_name = img["original"]
            new_path = img["path"]
            
            # Find and replace various patterns of image URLs
            # Pattern 1: Full URL with the specific image name
            pattern1 = re.compile(
                rf'src="[^"]*{re.escape(original_name)}"',
                re.IGNORECASE
            )
            modified_html = pattern1.sub(f'src="{new_path}"', modified_html)
            
            # Pattern 2: Any stratus.campaign-image.com URL that ends with this filename
            pattern2 = re.compile(
                rf'src="https://stratus\.campaign-image\.com/[^"]*{re.escape(original_name)}"',
                re.IGNORECASE
            )
            modified_html = pattern2.sub(f'src="{new_path}"', modified_html)
            
            # Pattern 3: Generic pattern for any external image URL with this filename
            pattern3 = re.compile(
                rf'src="[^"]*/{re.escape(original_name)}"',
                re.IGNORECASE
            )
            modified_html = pattern3.sub(f'src="{new_path}"', modified_html)
        
        return modified_html

def main():
    """Main function to run the template processor."""
    if len(sys.argv) < 2:
        print("Usage: python process_templates.py <program_name>")
        print("Example: python process_templates.py pm")
        sys.exit(1)
    
    program_name = sys.argv[1]
    
    try:
        processor = EmailTemplateProcessor(program_name)
        processed_emails = processor.process_all_templates()
        
        print("\n" + "="*50)
        print("PROCESSING SUMMARY")
        print("="*50)
        print(f"Program: {program_name}")
        print(f"Total emails processed: {len(processed_emails)}")
        
        main_emails = [e for e in processed_emails if not e.get('is_reminder', False)]
        reminder_emails = [e for e in processed_emails if e.get('is_reminder', False)]
        
        print(f"Main emails: {len(main_emails)}")
        print(f"Reminder emails: {len(reminder_emails)}")
        
        print("\nFiles created:")
        print(f"  HTML files: {processor.processed_dir}/emails/")
        print(f"  Images: {processor.processed_dir}/images/") 
        print(f"  Metadata: {processor.processed_dir}/metadata/")
        print(f"  Index: {processor.processed_dir}/index.json")
        
        print("\nNext steps:")
        print("1. Open website/index.html in a web browser")
        print("2. Select the program from the dropdown")
        print("3. Click 'Auto Play' to see the journey in action")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
