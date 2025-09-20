from pytrends.request import TrendReq
import json
import pandas as pd
import warnings

class CareerTrendAnalyzer:
    def __init__(self):
        self.pytrends = TrendReq(hl='en-US', tz=360)
        # Suppress the specific warning
        warnings.filterwarnings('ignore', category=FutureWarning, module='pytrends')

    def get_trending_keywords(self, keywords):
        """Fetch interest over time and related queries for given keywords"""
        try:
            # Clean and prepare keywords
            cleaned_keywords = [k.strip() for k in keywords if k.strip()]  # Remove the limit of 5
            
            # Initialize result dictionary
            interest_over_time_data = {}
            
            # Get data for each keyword individually to ensure separate trends
            for keyword in cleaned_keywords:
                self.pytrends.build_payload([keyword], cat=0, timeframe='today 12-m', geo='', gprop='')
                interest_df = self.pytrends.interest_over_time()
                
                if not interest_df.empty:
                    # Drop isPartial column and fill NA values
                    interest_df = interest_df.drop(columns=['isPartial'], errors='ignore')
                    interest_df = interest_df.fillna(0)
                    
                    # The column name from pytrends will be the keyword itself
                    # Make sure we use the original keyword as the key in our result
                    interest_over_time_data[keyword] = interest_df[keyword].to_dict()
                else:
                    interest_over_time_data[keyword] = {}
        
            return {
                "interest_over_time": interest_over_time_data
            }
        except Exception as e:
            print("Error fetching trend data:", e)
            return {"error": str(e)}
    
    def analyze_career_demand(self, interests):
        """Analyze career demand based on interests using trend data"""
        try:
            if not interests:
                return {"error": "No interests provided for trend analysis."}
            
            data = self.get_trending_keywords(interests)
            
            if "interest_over_time" in data and data["interest_over_time"]:
                career_demands = []
                for career, trend_data in data["interest_over_time"].items():
                    if trend_data:
                        values = list(trend_data.values())
                        avg_demand = sum(values) / len(values)
                        career_demands.append({"career": career, "demand": round(avg_demand, 2)})
                
                # Sort careers by demand in descending order
                career_demands.sort(key=lambda x: x["demand"], reverse=True)
                return {"keywords": career_demands}
            else:
                return {"error": "Could not retrieve career demand data."}
        
        except Exception as e:
            print("Error in trend analysis:", e)
            return {"error": str(e)}
