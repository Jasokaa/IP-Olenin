<?php
// Include functions file
require_once 'functions.php';

// Initialize session to store messages
session_start();

// Display messages if set in session
$statusMessage = '';
if (isset($_SESSION['message'])) {
    $statusClass = isset($_SESSION['error']) && $_SESSION['error'] ? 'status-error' : 'status-success';
    $statusMessage = "<div class='status-message {$statusClass}'>{$_SESSION['message']}</div>";
    
    // Clear the message
    unset($_SESSION['message']);
    unset($_SESSION['error']);
}

// Get the current tab from query parameter or default to 'form'
$activeTab = isset($_GET['tab']) ? $_GET['tab'] : 'form';

// Get record to edit if edit parameter is set
$editRecord = null;
if (isset($_GET['edit']) && !empty($_GET['edit'])) {
    $editRecord = getRecordById($_GET['edit']);
}

// Get all records for records tab
$records = getAllRecords();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Physical Fitness Test</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Physical Fitness Test Form</h1>
        
        <div class="tabs">
            <a href="index.php?tab=form" class="tab <?php echo $activeTab === 'form' ? 'active' : ''; ?>">Form</a>
            <a href="index.php?tab=records" class="tab <?php echo $activeTab === 'records' ? 'active' : ''; ?>">Records</a>
            <a href="index.php?tab=export" class="tab <?php echo $activeTab === 'export' ? 'active' : ''; ?>">Export Data</a>
        </div>
        
        <?php echo $statusMessage; ?>
        
        <!-- Form Tab -->
        <div id="form-tab" class="tab-content <?php echo $activeTab === 'form' ? 'active' : ''; ?>">
            <form id="fitness-form" action="api.php" method="POST">
                <input type="hidden" name="action" value="<?php echo $editRecord ? 'update' : 'create'; ?>">
                <?php if ($editRecord): ?>
                <input type="hidden" name="id" value="<?php echo htmlspecialchars($editRecord['id']); ?>">
                <?php endif; ?>
                
                <!-- Personal Information -->
                <fieldset>
                    <legend>Personal Information</legend>
                    <div class="form-group">
                        <label for="name">Full Name:</label>
                        <input type="text" id="name" name="name" required value="<?php echo $editRecord ? htmlspecialchars($editRecord['name']) : ''; ?>">
                    </div>
                    <div class="form-group">
                        <label for="age">Age:</label>
                        <input type="number" id="age" name="age" min="12" max="100" required value="<?php echo $editRecord ? htmlspecialchars($editRecord['age']) : ''; ?>">
                    </div>
                    <div class="form-group">
                        <label for="gender">Gender:</label>
                        <select id="gender" name="gender" required>
                            <option value="">Select option</option>
                            <option value="male" <?php echo ($editRecord && $editRecord['gender'] === 'male') ? 'selected' : ''; ?>>Male</option>
                            <option value="female" <?php echo ($editRecord && $editRecord['gender'] === 'female') ? 'selected' : ''; ?>>Female</option>
                            <option value="other" <?php echo ($editRecord && $editRecord['gender'] === 'other') ? 'selected' : ''; ?>>Other</option>
                        </select>
                    </div>
                </fieldset>

                <!-- Question 1 - Radio Buttons -->
                <fieldset>
                    <legend>Exercise Frequency</legend>
                    <div class="form-group">
                        <p class="question">1. How often do you engage in physical activity?</p>
                        <label class="option-label">
                            <input type="radio" name="exercise_frequency" value="rarely" required <?php echo ($editRecord && $editRecord['exercise_frequency'] === 'rarely') ? 'checked' : ''; ?>> 
                            Rarely (less than once a week)
                        </label>
                        <label class="option-label">
                            <input type="radio" name="exercise_frequency" value="sometimes" <?php echo ($editRecord && $editRecord['exercise_frequency'] === 'sometimes') ? 'checked' : ''; ?>> 
                            Sometimes (1-2 times a week)
                        </label>
                        <label class="option-label">
                            <input type="radio" name="exercise_frequency" value="regularly" <?php echo ($editRecord && $editRecord['exercise_frequency'] === 'regularly') ? 'checked' : ''; ?>> 
                            Regularly (3 or more times a week)
                        </label>
                    </div>
                </fieldset>

                <!-- Question 2 - Checkboxes -->
                <fieldset>
                    <legend>Exercise Preferences</legend>
                    <div class="form-group">
                        <p class="question">2. Which type of physical activities do you prefer?</p>
                        <?php
                        $exerciseTypes = [];
                        if ($editRecord && isset($editRecord['exercise_type'])) {
                            $exerciseTypes = is_array($editRecord['exercise_type']) ? $editRecord['exercise_type'] : [$editRecord['exercise_type']];
                        }
                        ?>
                        <label class="option-label">
                            <input type="checkbox" name="exercise_type[]" value="cardio" <?php echo (in_array('cardio', $exerciseTypes)) ? 'checked' : ''; ?>> 
                            Cardio (running, swimming, cycling)
                        </label>
                        <label class="option-label">
                            <input type="checkbox" name="exercise_type[]" value="strength" <?php echo (in_array('strength', $exerciseTypes)) ? 'checked' : ''; ?>> 
                            Strength Training (weights, resistance exercises)
                        </label>
                        <label class="option-label">
                            <input type="checkbox" name="exercise_type[]" value="flexibility" <?php echo (in_array('flexibility', $exerciseTypes)) ? 'checked' : ''; ?>> 
                            Flexibility (yoga, stretching, pilates)
                        </label>
                    </div>
                </fieldset>

                <!-- Question 3 - Dropdown -->
                <fieldset>
                    <legend>Fitness Goals</legend>
                    <div class="form-group">
                        <p class="question">3. What is your primary fitness goal?</p>
                        <select name="fitness_goal" required>
                            <option value="">Select one option</option>
                            <option value="weight_loss" <?php echo ($editRecord && $editRecord['fitness_goal'] === 'weight_loss') ? 'selected' : ''; ?>>Weight loss</option>
                            <option value="muscle_gain" <?php echo ($editRecord && $editRecord['fitness_goal'] === 'muscle_gain') ? 'selected' : ''; ?>>Muscle gain</option>
                            <option value="endurance" <?php echo ($editRecord && $editRecord['fitness_goal'] === 'endurance') ? 'selected' : ''; ?>>Improved endurance</option>
                        </select>
                    </div>
                </fieldset>

                <!-- Question 4 - Range Slider -->
                <fieldset>
                    <legend>Current Fitness Level</legend>
                    <div class="form-group">
                        <p class="question">4. How would you rate your current fitness level?</p>
                        <input type="range" id="fitness_level" name="fitness_level" min="1" max="3" step="1" 
                               value="<?php echo $editRecord ? htmlspecialchars($editRecord['fitness_level']) : '2'; ?>">
                        <div class="range-labels">
                            <span>Beginner</span>
                            <span>Intermediate</span>
                            <span>Advanced</span>
                        </div>
                    </div>
                </fieldset>

                <!-- Question 5 - Select with limited options -->
                <fieldset>
                    <legend>Physical Limitations</legend>
                    <div class="form-group">
                        <p class="question">5. Do you have any physical limitations or health concerns?</p>
                        <select name="limitations" required>
                            <option value="">Select one option</option>
                            <option value="none" <?php echo ($editRecord && $editRecord['limitations'] === 'none') ? 'selected' : ''; ?>>No limitations</option>
                            <option value="joint" <?php echo ($editRecord && $editRecord['limitations'] === 'joint') ? 'selected' : ''; ?>>Joint problems</option>
                            <option value="cardiovascular" <?php echo ($editRecord && $editRecord['limitations'] === 'cardiovascular') ? 'selected' : ''; ?>>Cardiovascular issues</option>
                        </select>
                    </div>
                </fieldset>

                <!-- Question 6 - Radio buttons for time -->
                <fieldset>
                    <legend>Exercise Duration</legend>
                    <div class="form-group">
                        <p class="question">6. How long can you typically exercise in one session?</p>
                        <label class="option-label">
                            <input type="radio" name="exercise_duration" value="short" required <?php echo ($editRecord && $editRecord['exercise_duration'] === 'short') ? 'checked' : ''; ?>> 
                            Less than 30 minutes
                        </label>
                        <label class="option-label">
                            <input type="radio" name="exercise_duration" value="medium" <?php echo ($editRecord && $editRecord['exercise_duration'] === 'medium') ? 'checked' : ''; ?>> 
                            30-60 minutes
                        </label>
                        <label class="option-label">
                            <input type="radio" name="exercise_duration" value="long" <?php echo ($editRecord && $editRecord['exercise_duration'] === 'long') ? 'checked' : ''; ?>> 
                            More than 60 minutes
                        </label>
                    </div>
                </fieldset>

                <!-- Question 7 - Buttons for selection -->
                <fieldset>
                    <legend>Recovery</legend>
                    <div class="form-group">
                        <p class="question">7. How long does it typically take you to recover after intense exercise?</p>
                        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                            <label class="option-label" style="flex: 1; text-align: center;">
                                <input type="radio" name="recovery_time" value="short" required <?php echo ($editRecord && $editRecord['recovery_time'] === 'short') ? 'checked' : ''; ?>>
                                <div style="padding: 10px; background-color: #ffb6c1; border-radius: 5px; margin: 0 5px;">
                                    Less than a day
                                </div>
                            </label>
                            <label class="option-label" style="flex: 1; text-align: center;">
                                <input type="radio" name="recovery_time" value="medium" <?php echo ($editRecord && $editRecord['recovery_time'] === 'medium') ? 'checked' : ''; ?>>
                                <div style="padding: 10px; background-color: #ffb6c1; border-radius: 5px; margin: 0 5px;">
                                    1-2 days
                                </div>
                            </label>
                            <label class="option-label" style="flex: 1; text-align: center;">
                                <input type="radio" name="recovery_time" value="long" <?php echo ($editRecord && $editRecord['recovery_time'] === 'long') ? 'checked' : ''; ?>>
                                <div style="padding: 10px; background-color: #ffb6c1; border-radius: 5px; margin: 0 5px;">
                                    More than 2 days
                                </div>
                            </label>
                        </div>
                    </div>
                </fieldset>

                <!-- Form Submission -->
                <div class="btn-container">
                    <button type="submit"><?php echo $editRecord ? 'Update Record' : 'Save Data'; ?></button>
                    <button type="reset">Reset Form</button>
                </div>
            </form>
        </div>
        
        <!-- Records Tab -->
        <div id="records-tab" class="tab-content <?php echo $activeTab === 'records' ? 'active' : ''; ?>">
            <h2>Saved Records</h2>
            <div id="records-container">
                <?php if (empty($records)): ?>
                <div id="no-records">No records found</div>
                <?php else: ?>
                <div id="records-list">
                    <?php foreach ($records as $record): ?>
                    <div class="record-item">
                        <h3><?php echo htmlspecialchars($record['name']); ?></h3>
                        <div class="record-details">
                            <p><strong>Age:</strong> <?php echo htmlspecialchars($record['age']); ?></p>
                            <p><strong>Gender:</strong> <?php echo htmlspecialchars($record['gender']); ?></p>
                            <p><strong>Exercise Frequency:</strong> <?php echo htmlspecialchars($record['exercise_frequency']); ?></p>
                            <p><strong>Exercise Types:</strong> <?php 
                                $types = is_array($record['exercise_type']) ? implode(', ', $record['exercise_type']) : $record['exercise_type'];
                                echo htmlspecialchars($types); 
                            ?></p>
                            <p><strong>Fitness Goal:</strong> <?php echo htmlspecialchars($record['fitness_goal']); ?></p>
                            <p><strong>Fitness Level:</strong> <?php echo htmlspecialchars($record['fitness_level']); ?></p>
                            <p><strong>Limitations:</strong> <?php echo htmlspecialchars($record['limitations']); ?></p>
                            <p><strong>Exercise Duration:</strong> <?php echo htmlspecialchars($record['exercise_duration']); ?></p>
                            <p><strong>Recovery Time:</strong> <?php echo htmlspecialchars($record['recovery_time']); ?></p>
                            <p><strong>Created:</strong> <?php echo date('Y-m-d H:i:s', strtotime($record['createdAt'])); ?></p>
                            <?php if (isset($record['updatedAt'])): ?>
                            <p><strong>Updated:</strong> <?php echo date('Y-m-d H:i:s', strtotime($record['updatedAt'])); ?></p>
                            <?php endif; ?>
                        </div>
                        <div class="record-actions">
                            <a href="index.php?tab=form&edit=<?php echo $record['id']; ?>" class="btn">Edit</a>
                            <a href="api.php?action=delete&id=<?php echo $record['id']; ?>" class="btn" onclick="return confirm('Are you sure you want to delete this record?');">Delete</a>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
        
        <!-- Export Tab -->
        <div id="export-tab" class="tab-content <?php echo $activeTab === 'export' ? 'active' : ''; ?>">
            <h2>Export Data</h2>
            <div class="form-group">
                <label for="data-format-selector">Select format:</label>
                <select id="data-format-selector" name="format">
                    <option value="json">JSON Format</option>
                    <option value="xml">XML Format</option>
                </select>
                <div class="btn-container">
                    <a href="api.php?action=export&format=json" class="btn" id="export-json-btn">Download JSON</a>
                    <a href="api.php?action=export&format=xml" class="btn" id="export-xml-btn">Download XML</a>
                </div>
            </div>
            <div id="export-preview">
                <h3>API Information:</h3>
                <pre>
Export Formats:
- JSON: /api.php?action=export&format=json
- XML: /api.php?action=export&format=xml

Operations:
- Create: POST to /api.php (action=create)
- Read: GET from /index.php?tab=records
- Update: POST to /api.php (action=update)
- Delete: GET /api.php?action=delete&id=RECORD_ID
                </pre>
            </div>
        </div>
    </div>

    <script>
        // Simple script to update export buttons when format changes
        document.addEventListener('DOMContentLoaded', function() {
            var formatSelector = document.getElementById('data-format-selector');
            var jsonBtn = document.getElementById('export-json-btn');
            var xmlBtn = document.getElementById('export-xml-btn');
            
            if (formatSelector) {
                formatSelector.addEventListener('change', function() {
                    var format = formatSelector.value;
                    if (format === 'json') {
                        jsonBtn.style.display = 'inline-block';
                        xmlBtn.style.display = 'none';
                    } else {
                        jsonBtn.style.display = 'none';
                        xmlBtn.style.display = 'inline-block';
                    }
                });
                
                // Initial state
                formatSelector.dispatchEvent(new Event('change'));
            }
        });
    </script>
</body>
</html>