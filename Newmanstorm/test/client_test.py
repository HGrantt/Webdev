from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import time

def invalid_reg(driver):
    create_user(driver, "HG", "secret") #to short username
    driver.find_element_by_id("name-error").text == "Invalid format."
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()

    create_user(driver, "HG?", "secret") #invalid char "?"
    assert driver.find_element_by_id("name-error").text == "Invalid format."
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()

    create_user(driver, "HGmannen", "se") #to short password
    assert driver.find_element_by_id("password-error").text == "Invalid format."
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()

    create_user(driver, "", "") #cannot be empty
    assert driver.find_element_by_id("password-error").text == "This field is required."
    assert driver.find_element_by_id("name-error").text == "This field is required."


def valid_reg_log_in_out(driver):
    create_user(driver, "HGmannen", "secret")
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()
    driver.find_element_by_id("formswitch").click()
    login(driver, "HGmannen", "secret")
    assert "HGmannen" in driver.title
    logout(driver)

def invalid_log(driver):
    login(driver, "intefinns", "secret") #user does not exist
    driver.find_element_by_id("error").text == "Wrong password!"
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()

    create_user(driver, "NewUser", "secret")
    driver.find_element_by_id("formswitch").click()
    login(driver, "NewUser", "wrongpass") #wrong password
    driver.find_element_by_id("error").text == "Wrong password!"
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()

    login(driver, "HG", "secret") #invalid username
    driver.find_element_by_id("name-error").text == "Invalid format."
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()

    login(driver, "HGmannen", "se") #invalid password
    driver.find_element_by_id("password-error").text == "Invalid format."
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()
    driver.find_element_by_id("formswitch").click()

def create_friendship(driver):
    create_user(driver, "name", "secret")
    driver.find_element_by_id("formswitch").click()
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()
    driver.find_element_by_id("formswitch").click()

    create_user(driver, "johndoe", "secret")
    driver.find_element_by_id("formswitch").click()
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()
    driver.find_element_by_id("formswitch").click()

    login(driver, "johndoe", "secret")
    driver.find_element_by_id("namesearch").send_keys("name")

    driver.find_element_by_id("submit").click()
    driver.find_element_by_id("namesearch").clear()

    driver.find_element_by_id("befriend").click()


    friendlist = driver.find_element_by_id("friendlist")
    friends = friendlist.find_elements_by_xpath("./*")
    #find yourself in friendlist
    assert friends[0].text == "johndoe"

    #unfrienbutton in friendprofile
    driver.find_element_by_id("befriend").text == "UNFRIEND"

    driver.find_element_by_id("namesearch").send_keys("johndoe")
    driver.find_element_by_id("submit").click()
    driver.find_element_by_id("namesearch").clear()

    friendlist = driver.find_element_by_id("friendlist")
    friends = friendlist.find_elements_by_xpath("./*")
    #find friend in your friendlist
    assert friends[0].text == "name"
    logout(driver)



def create_user(driver, uname, upassword):
    #Create user
    formswitch = driver.find_element_by_id("formswitch")
    formswitch.click()
    logreg = driver.find_element_by_id("logreg")
    username = driver.find_element_by_id("name")
    password = driver.find_element_by_id("password")
    username.send_keys(uname)
    password.send_keys(upassword)
    logreg.click()


def login(driver, uname, upassword):
    #login
    logreg = driver.find_element_by_id("logreg")
    username = driver.find_element_by_id("name")
    password = driver.find_element_by_id("password")
    username.send_keys(uname)
    password.send_keys(upassword)
    logreg.click()
    time.sleep(1)

def logout(driver):
    #logout
    logout = driver.find_element_by_id("logout")
    logout.click()
    assert "NewmanStorm" in driver.title
    time.sleep(1)

def posts_work(driver):
    create_user(driver, "testpost", "secret")
    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()

    formswitch = driver.find_element_by_id("formswitch")
    formswitch.click()

    time.sleep(1)
    create_user(driver, "testsend", "secret")

    driver.find_element_by_id("name").clear()
    driver.find_element_by_id("password").clear()

    formswitch = driver.find_element_by_id("formswitch")
    formswitch.click()

    time.sleep(1)

    login(driver, "testsend", "secret")

    driver.find_element_by_id("namesearch").send_keys("testpost")
    driver.find_element_by_id("submit").click()
    driver.find_element_by_id("namesearch").clear()

    driver.find_element_by_id("msgboard").send_keys("Testing this message")
    driver.find_element_by_id("submitmsg").click()
    driver.find_element_by_id("msgboard").clear()
    message = driver.find_element_by_id("posts")

    assert driver.find_element_by_class_name("imsg").text == "Testing this message"
    logout(driver)
    login(driver, "testpost", "secret")
    assert driver.find_element_by_class_name("imsg").text == "Testing this message"



def run_test():
    driver = webdriver.Firefox()
    driver.get("localhost:3000") #make sure the server is running
    assert "NewmanStorm" in driver.title

    #REG LOGIN LOGOUT WORKING:
    valid_reg_log_in_out(driver)
    #REG INVALID PASS USERNAME WORKING:
    invalid_reg(driver)
    #LOG INVALID PASS USERNAME WORKING:
    invalid_log(driver)
    #BEFRIEND UNFRIEND WORKING:
    create_friendship(driver)
    #POST MSG TO FROM BODY YOURWALL EMPTY:
    #RELOGIN CHECK MSGS UPDATE:
    posts_work(driver)

    print("Test Success!!!")
    driver.close()


if __name__ == '__main__':
    run_test()

# friend, unfriend, post search
