public class Student {
    static class Address
    {
        private String city;
        private String street;
        public Address() {}
        public Address(String city, String street) {
            this.city = city;
            this.street = street;
        }
        public String getCity() {
            return city;
        }
        public void setCity(String city) {
            this.city = city;
        }
        public String getStreet() {
            return street;
        }
        public void setStreet(String street) {
            this.street = street;
        }
        @Override
        public String toString() {
            return "Address{"+city+", "+street+"}";
        }
    }
    private String name;
    private Integer age;
    private Address address;

    public Student() {
    }

    @Override
    public String toString() {
        return "Student{"+name+", "+age+", "+address+"}";
    }

    public Student(String name, Integer age, Address address) {
        this.name = name;
        this.age = age;
        this.address = address;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
    public Address getAddress() {
        return address;
    }
    public void setAddress(Address address) {
        this.address = address;
    }
}
