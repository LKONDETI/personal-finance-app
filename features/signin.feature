Feature: User Login

  Scenario: User successfully logs in
    Given I am on the Login page
    When I enter valid credentials
    And I press the signin button
    Then I should see the index page
