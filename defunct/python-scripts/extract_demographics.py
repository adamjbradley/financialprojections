#!/usr/bin/env python3
"""
Extract Demographic Data from model-config.json into Individual Country Files
Creates separate JSON files for each country's demographic data
"""

import json
import os
from pathlib import Path

def extract_demographic_data():
    """Extract demographic data from model-config.json and create individual country files"""
    
    # Load the current model config
    config_path = '/Users/adambradley/Projects/Mastercard/ProductManager/financialprojections/model-config.json'
    demographics_dir = '/Users/adambradley/Projects/Mastercard/ProductManager/financialprojections/demographics'
    
    # Ensure demographics directory exists
    os.makedirs(demographics_dir, exist_ok=True)
    
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    regional_data = config.get('regionalData', {})
    countries = config.get('countries', {})
    
    # Extract each country's demographic data
    for country_key, demographic_info in regional_data.items():
        if 'demographicSegments' not in demographic_info:
            print(f"⚠️  Skipping {country_key} - no demographic segments found")
            continue
            
        country_name = countries.get(country_key, {}).get('name', country_key.title())
        
        # Create country-specific demographic file
        country_demographic_data = {
            "country": {
                "key": country_key,
                "name": country_name,
                "currency": countries.get(country_key, {}).get('currency', 'USD'),
                "currencySymbol": countries.get(country_key, {}).get('currencySymbol', '$'),
                "exchangeRate": countries.get(country_key, {}).get('exchangeRate', 1.0),
                "population": countries.get(country_key, {}).get('population', 0)
            },
            "metadata": {
                "version": "1.0.0",
                "lastUpdated": "2025-01-20",
                "description": f"Comprehensive demographic data for {country_name} including population, authentication rates, digital adoption, economic tiers, and growth projections.",
                "dataSource": "Enhanced APAC Revenue Projections System",
                "totalSegments": len(demographic_info['demographicSegments'])
            },
            "demographicSegments": demographic_info['demographicSegments']
        }
        
        # Calculate summary statistics for metadata
        segments = demographic_info['demographicSegments']
        total_population = sum(seg.get('population', 0) for seg in segments)
        avg_auth_rate = sum(seg.get('authPct', 0) for seg in segments) / len(segments) if segments else 0
        avg_digital_adoption = sum(seg.get('digitalAdoption', 0) for seg in segments) / len(segments) if segments else 0
        high_economic_segments = len([seg for seg in segments if seg.get('economicTier') == 'high'])
        
        country_demographic_data["summary"] = {
            "totalPopulation": round(total_population, 1),
            "averageAuthRate": round(avg_auth_rate, 1),
            "averageDigitalAdoption": round(avg_digital_adoption, 1),
            "highEconomicTierSegments": high_economic_segments,
            "mediumEconomicTierSegments": len([seg for seg in segments if seg.get('economicTier') == 'medium']),
            "lowEconomicTierSegments": len([seg for seg in segments if seg.get('economicTier') == 'low']),
            "averageUrbanization": round(sum(seg.get('urbanization', 0) for seg in segments) / len(segments), 1) if segments else 0,
            "averageGrowthRate": round(sum(seg.get('authGrowthRate', 3) for seg in segments) / len(segments), 1) if segments else 3
        }
        
        # Write country demographic file
        country_file = os.path.join(demographics_dir, f'{country_key}_demographics.json')
        with open(country_file, 'w') as f:
            json.dump(country_demographic_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Created {country_file}")
        print(f"   📊 {len(segments)} segments, {total_population:.1f}M population, {avg_auth_rate:.1f}% avg auth rate")
    
    return True

def create_demographics_index():
    """Create an index file listing all available demographic data files"""
    
    demographics_dir = '/Users/adambradley/Projects/Mastercard/ProductManager/financialprojections/demographics'
    index_file = os.path.join(demographics_dir, 'index.json')
    
    # Get list of demographic files
    demographic_files = []
    for file in os.listdir(demographics_dir):
        if file.endswith('_demographics.json'):
            country_key = file.replace('_demographics.json', '')
            
            # Load the file to get metadata
            file_path = os.path.join(demographics_dir, file)
            with open(file_path, 'r') as f:
                data = json.load(f)
            
            demographic_files.append({
                "countryKey": country_key,
                "countryName": data['country']['name'],
                "fileName": file,
                "totalSegments": data['metadata']['totalSegments'],
                "totalPopulation": data['summary']['totalPopulation'],
                "lastUpdated": data['metadata']['lastUpdated'],
                "version": data['metadata']['version']
            })
    
    # Sort by country name
    demographic_files.sort(key=lambda x: x['countryName'])
    
    index_data = {
        "metadata": {
            "title": "APAC Demographic Data Index",
            "description": "Index of all available demographic data files for APAC countries",
            "version": "1.0.0",
            "lastUpdated": "2025-01-20",
            "totalCountries": len(demographic_files),
            "totalSegments": sum(f['totalSegments'] for f in demographic_files)
        },
        "countries": demographic_files
    }
    
    with open(index_file, 'w') as f:
        json.dump(index_data, f, indent=2)
    
    print(f"✅ Created demographics index: {index_file}")
    print(f"   📋 {len(demographic_files)} countries indexed")
    
    return index_data

def update_model_config():
    """Update model-config.json to reference external demographic files"""
    
    config_path = '/Users/adambradley/Projects/Mastercard/ProductManager/financialprojections/model-config.json'
    
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    # Replace regionalData with references to external files
    if 'regionalData' in config:
        countries_with_demographics = list(config['regionalData'].keys())
        
        config['demographicDataConfig'] = {
            "externalFiles": True,
            "demographicsDirectory": "./demographics/",
            "indexFile": "./demographics/index.json",
            "availableCountries": countries_with_demographics,
            "filePattern": "{country}_demographics.json",
            "lastMigrated": "2025-01-20"
        }
        
        # Keep a small sample for backward compatibility but mark as deprecated
        config['regionalData'] = {
            "_deprecated": "This data has been moved to external files. Use demographicDataConfig to load current data.",
            "_migrationDate": "2025-01-20",
            "_newLocation": "./demographics/",
            "india": {
                "demographicSegments": [
                    {
                        "name": "Sample - Uttar Pradesh", 
                        "population": 237.9, 
                        "authPct": 11, 
                        "authFreq": 1.0, 
                        "digitalAdoption": 45, 
                        "economicTier": "medium", 
                        "urbanization": 22, 
                        "authGrowthRate": 8,
                        "_note": "This is sample data. Load full data from demographics/india_demographics.json"
                    }
                ]
            }
        }
    
    # Update model config with new structure
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Updated model-config.json with external demographic references")

def main():
    """Main function to extract and organize demographic data"""
    
    print("🚀 Starting demographic data externalization...")
    print("=" * 60)
    
    # Step 1: Extract demographic data to individual files
    print("\n📊 Step 1: Extracting demographic data...")
    if extract_demographic_data():
        print("✅ Demographic data extraction completed")
    
    # Step 2: Create index file
    print("\n📋 Step 2: Creating demographics index...")
    index_data = create_demographics_index()
    print("✅ Demographics index created")
    
    # Step 3: Update model config
    print("\n🔧 Step 3: Updating model configuration...")
    update_model_config()
    print("✅ Model configuration updated")
    
    print("\n" + "=" * 60)
    print("🎉 Demographic data externalization completed!")
    print(f"📁 Files created in: ./demographics/")
    print(f"📊 Total countries: {index_data['metadata']['totalCountries']}")
    print(f"🎯 Total segments: {index_data['metadata']['totalSegments']}")
    print("\n📋 Created files:")
    for country in index_data['countries']:
        print(f"   • {country['fileName']} ({country['totalSegments']} segments)")
    print(f"   • index.json (master index)")

if __name__ == "__main__":
    main()