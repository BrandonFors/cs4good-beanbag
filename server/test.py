from pymongo import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://bforseth:sTh4uYbQx72OaClx@beanbagcluster.lsads.mongodb.net/?retryWrites=true&w=majority&appName=BeanbagCluster"

try:
    client = MongoClient(uri, server_api=ServerApi('1'))
    client.admin.command('ping')
    print("Connected to MongoDB!")
except Exception as e:
    print(f"Connection failed: {e}")
# testing


import pytest
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# Mock MongoDB before importing app to avoid connection issues
with patch.dict('os.environ', {'MONGO_URI': 'mongodb://test'}):
    with patch('pymongo.MongoClient') as mock_mongo_client:
        mock_client_instance = MagicMock()
        mock_client_instance.admin.command.return_value = True
        mock_db = MagicMock()
        mock_client_instance.__getitem__.return_value = mock_db
        mock_mongo_client.return_value = mock_client_instance
        
        # Add the server directory to the path so we can import app
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        
        from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_mongo_collections():
    """Mock MongoDB collections for testing."""
    # Create mock collections
    mock_scores = MagicMock()
    mock_teams = MagicMock()
    
    # Patch the collections in the app module
    with patch('app.scores_collection', mock_scores), \
         patch('app.teams_collection', mock_teams):
        
        yield {
            'teams': mock_teams,
            'scores': mock_scores
        }


class TestGetScoresOrder:
    """Test that get_scores returns teams in original order, not sorted by mean."""
    
    def test_teams_preserve_insertion_order_not_sorted_by_mean(self, client, mock_mongo_collections):
        """Test that teams are returned in insertion order, even when means would suggest different order."""
        mock_scores = mock_mongo_collections['scores']
        
        # Create test data where Team B (higher mean) comes BEFORE Team A (lower mean) in insertion order
        # If sorted by mean (ascending), Team A would come first, but we want insertion order (Team B first)
        mock_scores.find.return_value = [
            {
                "name": "Team B", 
                "scores": ["4", "5", "5"]  # Mean = 4.67 (higher mean, but inserted first)
            },
            {
                "name": "Team A",
                "scores": ["1", "2", "3"]  # Mean = 2.0 (lower mean, but inserted second)
            }
        ]
        
        response = client.get('/get_scores')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Verify we got 2 teams (limited by [:2])
        assert len(data) == 2
        
        # Verify order is preserved (Team B first, Team A second) - insertion order
        # NOT sorted by mean (which would put Team A first, Team B second)
        assert data[0]["team"] == "Team B"
        assert data[1]["team"] == "Team A"
        
        # Verify means are correct
        assert abs(data[0]["mean"] - 4.67) < 0.01
        assert abs(data[1]["mean"] - 2.0) < 0.01
        
        # Verify that if we sorted by mean (ascending), the order would be DIFFERENT
        # This confirms we're NOT sorting - we're preserving insertion order
        sorted_by_mean = sorted(data, key=lambda x: x["mean"])
        assert sorted_by_mean[0]["team"] == "Team A"  # Lower mean comes first when sorted
        assert sorted_by_mean[1]["team"] == "Team B"  # Higher mean comes second when sorted
        # But our actual data is in insertion order (Team B, Team A), not sorted order (Team A, Team B)
        assert data[0]["team"] != sorted_by_mean[0]["team"]  # Different order confirms no sorting
    
    def test_teams_preserve_order_with_three_teams(self, client, mock_mongo_collections):
        """Test order preservation with three teams where middle team has highest mean."""
        mock_scores = mock_mongo_collections['scores']
        
        # Team order: Low mean, High mean, Medium mean
        # If sorted by mean: Low, Medium, High
        # We want: Low, High, Medium (insertion order)
        mock_scores.find.return_value = [
            {
                "name": "Team Low",
                "scores": ["1", "1", "1"]  # Mean = 1.0
            },
            {
                "name": "Team High",
                "scores": ["5", "5", "5"]  # Mean = 5.0
            },
            {
                "name": "Team Medium",
                "scores": ["3", "3", "3"]  # Mean = 3.0
            }
        ]
        
        response = client.get('/get_scores')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Should only return first 2 teams (limited by [:2])
        assert len(data) == 2
        
        # Verify insertion order is preserved
        assert data[0]["team"] == "Team Low"
        assert data[1]["team"] == "Team High"
        
        # Verify means
        assert abs(data[0]["mean"] - 1.0) < 0.01
        assert abs(data[1]["mean"] - 5.0) < 0.01
    
    def test_teams_with_same_mean_preserve_order(self, client, mock_mongo_collections):
        """Test that teams with identical means still preserve insertion order."""
        mock_scores = mock_mongo_collections['scores']
        
        mock_scores.find.return_value = [
            {
                "name": "Team X",
                "scores": ["2", "3", "4"]  # Mean = 3.0
            },
            {
                "name": "Team Y",
                "scores": ["1", "3", "5"]  # Mean = 3.0 (same)
            }
        ]
        
        response = client.get('/get_scores')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Order should be preserved
        assert data[0]["team"] == "Team X"
        assert data[1]["team"] == "Team Y"
        assert abs(data[0]["mean"] - 3.0) < 0.01
        assert abs(data[1]["mean"] - 3.0) < 0.01
    
    def test_empty_scores_preserve_order(self, client, mock_mongo_collections):
        """Test that teams with no scores still preserve order."""
        mock_scores = mock_mongo_collections['scores']
        
        mock_scores.find.return_value = [
            {
                "name": "Team Empty1",
                "scores": []  # Mean = 0
            },
            {
                "name": "Team Empty2",
                "scores": []  # Mean = 0
            }
        ]
        
        response = client.get('/get_scores')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Order should be preserved even with empty scores
        assert data[0]["team"] == "Team Empty1"
        assert data[1]["team"] == "Team Empty2"
        assert data[0]["mean"] == 0
        assert data[1]["mean"] == 0
    
    def test_frequency_data_correct(self, client, mock_mongo_collections):
        """Test that frequency data is calculated correctly while preserving order."""
        mock_scores = mock_mongo_collections['scores']
        
        mock_scores.find.return_value = [
            {
                "name": "Team Test",
                "scores": ["0", "1", "2", "2", "3", "5", "5", "5"]
            }
        ]
        
        response = client.get('/get_scores')
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert len(data) == 1
        assert data[0]["team"] == "Team Test"
        
        # Verify frequency data: [count of 0, count of 1, count of 2, count of 3, count of 4, count of 5]
        # Scores: 0 appears 1x, 1 appears 1x, 2 appears 2x, 3 appears 1x, 4 appears 0x, 5 appears 3x
        expected_freq = [1, 1, 2, 1, 0, 3]
        assert data[0]["freq"] == expected_freq
